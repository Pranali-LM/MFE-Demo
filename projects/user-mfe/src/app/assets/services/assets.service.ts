import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssetPlans,
  DeviceModelConfig,
  ManageDeviceReqParams,
  PatchAssetParam,
  UpdateMdvrConfigReqBody,
  getDeviceTaskReqParams,
} from '@app-assets/models/assets.model';
import { setParams } from '@app-core/models/core.model';
import { API } from '@app-core/constants/api.constants';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import { map, tap } from 'rxjs/operators';
import { CLIENT_CONFIG } from '@config/config';
import { DevicePrimaryKey } from '@config/config.base';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  public assetDetails: any;
  public fleetDriverList: any[];
  public currentPageEvent: any;

  constructor(private http: HttpClient, private cacheService: HttpCacheService) {}

  public patchAsset(body: any, params: PatchAssetParam): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.patch(API.PATCH_ASSET, body, httpOptions).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_FLEET_ASSETS);
      })
    );
  }

  public modifyDeviceMapping(body: any): Observable<any> {
    return this.http.patch(API.MODIFY_DEVICE_MAPPING, body, { observe: 'response' });
  }

  public getFleetAssets(params: any, isRefresh?: boolean): Observable<any | HttpResponse<Blob>> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_FLEET_ASSETS);
    }
    return this.http.get(API.GET_FLEET_ASSETS, httpOptions);
  }

  public exportAssets(params: any): Observable<any | HttpResponse<Blob>> {
    const httpOptions = {
      params: setParams(params),
    };
    this.cacheService.burstCache$.next(API.EXPORT_ASSETS);
    return this.http.get(API.EXPORT_ASSETS, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob',
    });
  }

  public getDriverList(isRefresh?: boolean, userType = 'DRIVER'): Observable<any> {
    const httpOptions = {
      params: setParams({ userType }),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_REGISTERED_DRIVERS);
    }
    return this.http.get(API.GET_REGISTERED_DRIVERS, httpOptions);
  }

  public getAssetDetails(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_ASSET_DETAILS, httpOptions);
  }

  public getDeviceDetails(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DEVICE_DETAILS, httpOptions);
  }

  public manageDevice(deviceId: string, params: ManageDeviceReqParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.post(API.MANAGE_DEVICE(deviceId), null, httpOptions);
  }

  public triggerDeviceTask(deviceId: string, body: any): Observable<any> {
    const url = API.TRIGGER_DEVICE_TASK(deviceId);
    return this.http.post(url, body);
  }

  public getDeviceTaskStatus(deviceId: string, params: getDeviceTaskReqParams): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.GET_DEVICE_TASK_STATUS(deviceId), httpOptions);
  }

  public extractFilename(contentDispositionHeader: string): string {
    return contentDispositionHeader.split(';')[1].trim().split('=')[1].replace(/"/g, '');
  }

  public downloadFile(data: any, filename = 'data', type: string) {
    const blob = new Blob([data], { type });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {
      // if Safari open in new window to save file with random filename.
      downloadLink.setAttribute('target', '_blank');
    }
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', filename);
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  public batchAssetUpdation(uploadedFile: any): Observable<any> {
    const formData: any = new FormData();
    formData.append('assets', uploadedFile, uploadedFile.name);
    return this.http.post(API.BATCH_ASSET_UPDATION, formData, { observe: 'response' }).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.EXPORT_ASSETS);
        this.cacheService.burstCache$.next(API.GET_FLEET_ASSETS);
      })
    );
  }

  public getSampleAssetsCsv(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.SAMPLE_ASSET_CSV_DOWNLOAD, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob',
    });
  }

  public isDeviceIdPrimaryKey() {
    return CLIENT_CONFIG.devicePrimaryKey === DevicePrimaryKey.DeviceId;
  }

  public batchDeviceProvisioning(uploadedFile: any): Observable<any> {
    const formData: any = new FormData();
    formData.append('devices', uploadedFile, uploadedFile.name);
    return this.http.post(API.BATCH_DEVICE_PROVISIONING, formData, { observe: 'response' }).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_FLEET_DEVICES);
      })
    );
  }

  public getSampleDevicesCsv(params: any): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get(API.PROVISIONED_SAMPLE_CSV, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob',
    });
  }

  public getFleetDevices(params: any, isRefresh?: boolean): Observable<any> {
    const httpOptions = {
      params: setParams(params),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_FLEET_DEVICES);
    }
    return this.http.get(API.GET_FLEET_DEVICES, httpOptions);
  }

  public provisionDevice(body: any): Observable<any> {
    return this.http.post(API.PROVISION_DEVICE, body, { observe: 'response' }).pipe(
      tap(() => {
        this.cacheService.burstCache$.next(API.GET_FLEET_DEVICES);
      })
    );
  }

  public getAssetPlans() {
    const httpOptions = {
      params: setParams({ cameraType: 'RIDECAM_PLUS' }),
    };
    return this.http.get<AssetPlans>(API.ASSET_PLANS, httpOptions);
  }

  public getDeviceModelConfig(deviceId: string) {
    const httpOptions = {
      params: setParams({ deviceId }),
    };
    return this.http.get<{ data: DeviceModelConfig[] }>(API.DEVICE_MODEL_CONFIG, httpOptions).pipe(map((res) => res.data[0]));
  }

  public updateMdvrConfig(deviceId: string, body: UpdateMdvrConfigReqBody) {
    const httpOptions = {
      params: setParams({ deviceId }),
    };
    return this.http.patch(API.UPDATE_MDVR_CONFIG, body, httpOptions);
  }

  public getAssetTags(assetId: string) {
    const url = API.GET_ASSET_TAGS(assetId);
    return this.http.get(url);
  }
}
