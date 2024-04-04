import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MDVR_AVAILBLE_VIEWS } from '@app-assets/constants/assets.constants';
import { AssetDetails, DeviceModelConfig, MdvrCameraConfig } from '@app-assets/models/assets.model';
import { dirtyCheck } from '@app-core/models/dirty-check';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ChannelMappingFg {
  source: FormControl<string>;
  view: FormControl<string>;
  resolution?: FormControl<string>;
  hflip?: FormControl<boolean>;
  vflip?: FormControl<boolean>;
}

interface MdvrConfigForm {
  serialId?: FormControl<string>;
  channelMappings: FormArray<FormGroup<ChannelMappingFg>>;
}

@Component({
  selector: 'app-mdvr-config',
  templateUrl: './mdvr-config.component.html',
  styleUrls: ['./mdvr-config.component.scss'],
})
export class MdvrConfigComponent implements OnInit, OnDestroy {
  @Input()
  private assetDetails: AssetDetails;

  @Input()
  private deviceModelConfig: DeviceModelConfig;

  private ngUnsubscribe = new Subject<void>();

  public isDirty$: Observable<boolean> = of(false);
  public mdvrConfigForm: FormGroup<MdvrConfigForm>;
  public availableViews = MDVR_AVAILBLE_VIEWS;
  public availableSources: string[] = [];
  public expandedChannelIndex = -1;
  public isConvoyCamera: boolean;
  private mdvrCameras: MdvrCameraConfig[];
  public showSerialID: boolean = false;
  public disableAddCameras: boolean = false;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.deviceModelConfig) {
      const { mdvrCameras = [] } = this.deviceModelConfig || {};
      this.mdvrCameras = mdvrCameras;
      this.availableSources = mdvrCameras.reduce((a, c) => [...a, ...c.sources], []);
      this.isConvoyCamera = mdvrCameras.some((c) => c.cameraInterface === 'CONVOY');
      this.generateForm();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private generateForm() {
    const { channelMappings = [], serialId = '' } = this.assetDetails?.mdvrConfig || {};
    const channelsControls = channelMappings.map((c) => this.getChannelFg(c));
    this.mdvrConfigForm = this.fb.group({
      channelMappings: this.fb.array(channelsControls),
    });
    if (this.isConvoyCamera) {
      this.mdvrConfigForm.addControl('serialId', this.fb.control(serialId, [Validators.required, Validators.maxLength(8)]));
      if (this.mdvrConfigForm?.value.channelMappings?.length && this.mdvrConfigForm.value.channelMappings[0].source.startsWith('UVC')) {
        this.mdvrConfigForm.removeControl('serialId');
      }
    }
    this.formValueChanges(this.mdvrConfigForm.getRawValue());
  }

  private formValueChanges(source: any) {
    if (this.mdvrConfigForm) {
      this.isDirty$ = this.mdvrConfigForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe), dirtyCheck(of(source)));
      this.isDirty$.subscribe();
    }
  }

  public getCameraConfig(source: string) {
    if (!source) {
      return {} as MdvrCameraConfig;
    }
    source.startsWith('CONVOY') ? (this.showSerialID = true) : (this.showSerialID = false);

    const { mdvrCameras = [] } = this.deviceModelConfig || {};
    const cameraConfig = mdvrCameras.find((c) => c.sources.includes(source));
    return cameraConfig;
  }

  private getChannelFg(channelMapping?: any): FormGroup<ChannelMappingFg> {
    const { source, view, resolution, hflip, vflip } = channelMapping || {};
    const channelMappingFg = this.fb.group<ChannelMappingFg>({
      source: this.fb.control(source, [Validators.required]),
      view: this.fb.control(view, [Validators.required]),
    });

    this.addResolution(channelMappingFg, channelMapping, resolution, source);
    if (this.isConvoyCamera) {
      const channelValues = channelMapping?.source;
      let convoyCameraOptions = null;

      if (channelValues && channelValues.startsWith('CONVOY')) {
        convoyCameraOptions = this.mdvrCameras.filter((element) => element.cameraInterface === 'CONVOY');
      } else if (channelValues && channelValues.startsWith('UVC')) {
        convoyCameraOptions = this.mdvrCameras.filter((element) => element.cameraInterface === 'UVC');
        this.availableSources = convoyCameraOptions?.reduce((a, c) => [...a, ...c.sources], []) || [];
      } else {
        if (
          this.mdvrConfigForm?.value?.channelMappings?.length &&
          this.mdvrConfigForm?.value?.channelMappings.some((e) => e.source.startsWith('CONVOY'))
        ) {
          convoyCameraOptions = this.mdvrCameras.filter((element) => element.cameraInterface === 'CONVOY');
        } else if (
          this.mdvrConfigForm?.value?.channelMappings?.length &&
          this.mdvrConfigForm?.value?.channelMappings.some((e) => e.source.startsWith('UVC'))
        ) {
          convoyCameraOptions = this.mdvrCameras.filter((element) => element.cameraInterface === 'UVC');
        } else {
          convoyCameraOptions = this.mdvrCameras;
        }
      }
      if (convoyCameraOptions) {
        this.availableSources = convoyCameraOptions.reduce((a, c) => [...a, ...c.sources], []);
      }
    }
    if (!source) {
      return channelMappingFg;
    }
    const cameraConfig = this.getCameraConfig(source);
    if (cameraConfig.hflip) {
      channelMappingFg.addControl('hflip', this.fb.control(hflip));
    }
    if (cameraConfig.vflip) {
      channelMappingFg.addControl('vflip', this.fb.control(vflip));
    }
    return channelMappingFg;
  }

  private addResolution(
    channelMappingFg: FormGroup<ChannelMappingFg>,
    channelMapping: any,
    resolution: string | undefined,
    source: string
  ) {
    if (channelMapping && this.assetDetails?.mdvrConfig && this.assetDetails?.mdvrConfig?.channelMappings.length) {
      channelMappingFg.addControl(
        'resolution',
        this.fb.control(resolution || this.getResolutionFromChannels(this.assetDetails?.mdvrConfig?.channelMappings) || '640x360')
      );
    } else {
      if (this.mdvrConfigForm.value.channelMappings.length > 0) {
        channelMappingFg.addControl(
          'resolution',
          this.fb.control(resolution || this.getResolutionFromChannels(this.mdvrConfigForm.value.channelMappings) || '640x360')
        );
      } else {
        channelMappingFg.addControl('resolution', this.fb.control(resolution || '640x360'));
      }
    }
    if (!source) {
      channelMappingFg.get('resolution').disable();
    }
  }

  private getResolutionFromChannels(channels): string {
    const tviChannel = channels.find((channel) => channel && channel.source && channel.source.startsWith('TVI'));
    if (tviChannel) {
      return tviChannel?.resolution || '640x360';
    } else {
      return '640x360';
    }
  }

  public channelMappings() {
    return this.mdvrConfigForm.get('channelMappings') as FormArray<FormGroup<ChannelMappingFg>>;
  }

  public addChannel() {
    this.channelMappings().push(this.getChannelFg());
    this.setExpandedChannelIndex(this.channelMappings().length - 1);
    if (
      this.isConvoyCamera &&
      this.mdvrConfigForm.value.channelMappings.length &&
      this.mdvrConfigForm.value.channelMappings[0].source === null
    ) {
      this.disableAddCameras = true;
    }
  }

  public removeChannel(channelIndex: number) {
    this.channelMappings().removeAt(channelIndex);
    if (this.isConvoyCamera && !this.channelMappings().value.length) {
      this.availableSources = this.mdvrCameras.reduce((a, c) => [...a, ...c.sources], []);
    } else if (!this.isConvoyCamera && !this.channelMappings().value.length) {
      this.availableSources = this.mdvrCameras.reduce((a, c) => [...a, ...c.sources], []);
    }
    this.isConvoyCamera = this.mdvrCameras.some((c) => c.cameraInterface === 'CONVOY');
    if (this.mdvrCameras.some((c) => c.cameraInterface === 'CONVOY')) {
      if (!this.channelMappings().value.length) {
        this.showSerialID = false;
      }
    }

    if (this.isConvoyCamera && !this.mdvrConfigForm.value.channelMappings.length) {
      this.disableAddCameras = false;
      if (this.mdvrConfigForm.get('serialId')) {
        this.mdvrConfigForm.removeControl('serialId');
      }
    }
  }

  public disableChannelConfigOptions(formControlName: string, value: string) {
    const channels: any[] = this.channelMappings().value;
    return channels.some((m) => m[formControlName] === value);
  }

  public channelSupportedResolutions(channelIndex: number) {
    const { source } = this.channelMappings().at(channelIndex).value;
    if (!source) {
      return [];
    }
    const cameraConfig = (this.deviceModelConfig?.mdvrCameras || []).find((c) => c.sources.includes(source));
    const resolutions = cameraConfig.resolution.enum;
    return resolutions;
  }

  public setExpandedChannelIndex(index: number) {
    this.expandedChannelIndex = index;
  }

  public onChannelSourceChange(event: MatSelectChange, channelIndex: number) {
    const source = event.value;
    const cameraConfig = this.getCameraConfig(source);
    const channelConfigFg = this.channelMappings().at(channelIndex);
    if (this.isConvoyCamera) {
      this.disableAddCameras = false;
      const filterCondition = cameraConfig.cameraInterface === 'CONVOY';
      const cameraInterfaceType = this.mdvrCameras.filter((element) =>
        filterCondition ? element.cameraInterface === 'CONVOY' : element.cameraInterface !== 'CONVOY'
      );
      this.availableSources = cameraInterfaceType.reduce((a, c) => [...a, ...c.sources], []);
      if (source.startsWith('CONVOY')) {
        const { serialId = '' } = this.assetDetails?.mdvrConfig || {};
        channelConfigFg.removeControl('resolution');
        this.mdvrConfigForm.addControl('serialId', this.fb.control(serialId, [Validators.required, Validators.maxLength(8)]));
      }

      if (source.startsWith('UVC') && this.isConvoyCamera) {
        if (this.mdvrConfigForm.controls.hasOwnProperty('serialId')) {
          this.mdvrConfigForm.removeControl('serialId');
        }
      }
    }

    if (cameraConfig.resolution.enum.length > 1) {
      channelConfigFg.addControl('resolution', this.fb.control(cameraConfig.resolution.default));
      channelConfigFg.get('resolution').enable();
      this.tviResolutionChange(channelIndex);
    } else {
      channelConfigFg.removeControl('resolution');
    }

    if (cameraConfig.hflip) {
      channelConfigFg.addControl('hflip', this.fb.control(false));
    } else {
      channelConfigFg.removeControl('hflip');
    }

    if (cameraConfig.vflip) {
      channelConfigFg.addControl('vflip', this.fb.control(false));
    } else {
      channelConfigFg.removeControl('vflip');
    }
  }

  public onChannelResolutionChange(event: MatSelectChange, channelIndex: number) {
    const resolution = event.value;
    const channelConfigFg = this.channelMappings().at(channelIndex);
    if (channelConfigFg.value.source.startsWith('TVI')) {
      const allTviChannelConfigFg = this.channelMappings().controls.filter((c) => c.value.source && c.value.source.startsWith('TVI'));
      allTviChannelConfigFg.forEach((c) => {
        c.patchValue({ resolution });
      });
    }
  }

  private tviResolutionChange(channelIndex: number) {
    const channelConfigFg = this.channelMappings().at(channelIndex);
    if (channelConfigFg.value.source.startsWith('TVI')) {
      const resolution = this.channelMappings().value.filter((c) => c.source.startsWith('TVI'))[0].resolution;
      this.channelMappings().controls.forEach((c) => {
        if (c.value.source?.startsWith('TVI')) {
          c.patchValue({ resolution });
        } else {
          c.patchValue({ resolution: '640x360' });
        }
      });
    } else {
      this.channelMappings().controls.forEach((c) => {
        if (c.value.source?.startsWith('UVC')) {
          c.patchValue({ resolution: '640x360' });
        }
      });
    }
  }

  public getChannelViewDisplayName(channelView: string) {
    if (!channelView) {
      return;
    }
    return this.availableViews.find((v) => v.value === channelView).label;
  }
}
