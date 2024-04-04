import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { LoginFleetInfo } from '@app-core/models/core.model';
import { AccessService } from '@app-core/services/access/access.service';
import { DataService } from '@app-core/services/data/data.service';
import { UpdateTags } from '@app-shared/actions/tags.action';
import { State } from '@app-shared/reducers';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-tagging-filter-v2',
  templateUrl: './tagging-filter-v2.component.html',
  styleUrls: ['./tagging-filter-v2.component.scss'],
})
export class TaggingFilterV2Component implements OnInit, OnChanges, OnDestroy {
  @Input() entityType = '';
  @Input() dropDownType = 'assign';
  @Input() public assignedTagList = [];
  @Input() public numOfTagsToDisplay = 1;
  @Input() attributeType = '';
  @Input() roleId = '';
  @Input() isClearDropDown = false;
  @Input() isUserPage = false;

  @ViewChild('mySelect') mySelect;

  @Output() public selectedTags: EventEmitter<any> = new EventEmitter();

  public tags = new FormControl();
  public isEditMode = false;
  public getAllTagsLoader = false;
  public allAttrTagList = [];
  public filteredAttribute: any[] = [];
  public tagList = [];
  public ids = [];
  public totalTags = 0;
  private ngUnsubscribeOnChanges: Subject<void> = new Subject<void>();
  public tagIds: any[];
  public allTags: any[];

  private currentFleetId = '';
  private currentFleetInfo: LoginFleetInfo;
  private allowedUserTags = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private taggingService: TaggingService,
    private accessService: AccessService,
    private dataService: DataService,
    private translate: TranslateService,
    private store: Store<State>,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const { fleets = [] } = this.accessService.getLoginInfo();

    this.tags.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: any) => {
      this.tagList = [];
      const selectedAccessTags = [];
      value?.map((tagTd) => {
        this.allAttrTagList?.map((attr) => {
          attr?.tags?.map((tag) => {
            if (tag?.tagId === tagTd) {
              this.tagList.push(tag?.tagName);
              if (attr?.attributeType === 'ACCESS') {
                selectedAccessTags.push(tag);
              }
            }
          });
        });
      });
      const disableLastAccessTag = this.allowedUserTags.length && selectedAccessTags.length === 1;
      this.filteredAttribute.forEach((attr) => {
        attr?.tags?.map((tag) => {
          if (disableLastAccessTag && tag?.tagId === selectedAccessTags[0].tagId) {
            tag.disabled = true;
          } else {
            tag.disabled = false;
          }
        });
      });
      this.cdRef.detectChanges();
      this.selectedTags.emit(value);
    });

    this.dataService._currentFleet.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (value: string) => {
      if (value) {
        this.currentFleetId = value;
        this.currentFleetInfo = fleets.filter((x: any) => x.fleetId === this.currentFleetId)[0];
        await this.getTags();
      }
    });
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (changes.roleId && changes.roleId.currentValue) {
      await this.getTags();
    }
    // this.store
    //   .select(getTags)
    //   .pipe(takeUntil(this.ngUnsubscribeOnChanges))
    //   .subscribe((reportFilter) => {
    //     const { allTags } = reportFilter;
    //     this.allTags = allTags;
    //   });
    if (changes.assignedTagList && changes.assignedTagList.currentValue) {
      this.assignedTagList.length &&
        this.assignedTagList.forEach((assignedTag) => {
          const tagId = assignedTag.tagId;
          const matchingTag = this.filteredAttribute.find((tag) => tag?.tags?.some((t) => t?.tagId === tagId));

          if (matchingTag) {
            const matchingTagData = matchingTag.tags.find((t) => t.tagId === tagId);
            Object.assign(assignedTag, matchingTagData);
          }
        });

      this.assignSelectedDropdownValue();
    }
    if (changes.isClearDropDown && changes.isClearDropDown.currentValue) {
      if (this.isClearDropDown) {
        this.tagList = [];
        this.tags.patchValue([]);
      }
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribeOnChanges.next();
    this.ngUnsubscribeOnChanges.complete();
  }

  onInputChange(event: any) {
    const searchInput = event.target.value.toLowerCase();
    let allTag = [];
    allTag = JSON.parse(JSON.stringify(this.allAttrTagList));
    this.filteredAttribute = allTag?.filter((attr) => {
      let filtag = [];
      filtag = attr.tags?.filter((tag) => {
        const tagLower = tag?.tagName?.toLowerCase();
        return tagLower.includes(searchInput);
      });
      attr.tags = filtag;
      return attr.tags?.length > 0;
    });
  }

  onOpenChange(searchInput: any) {
    if (!searchInput) {
      return;
    }
    searchInput.value = '';
    this.filteredAttribute = [...this.allAttrTagList];
  }

  public editMode() {
    this.isEditMode = true;
  }

  public doneMode() {
    this.isEditMode = false;
  }

  private async getTags(): Promise<any> {
    try {
      this.getAllTagsLoader = true;
      this.totalTags = 0;
      const params = {
        limit: 500,
        offset: 0,
      };
      if (this.entityType) {
        params['entityNames[]'] = this.entityType;
      }
      if (this.roleId) {
        params['roleIds[]'] = this.roleId;
      }

      const res = await this.taggingService.getAttributes(params).toPromise();
      const formattedData = (res?.data || [])
        .map((attr) => {
          const { entities = [], tags = [] } = attr;
          this.totalTags = this.totalTags + (tags?.length || 0);
          if ((entities || []).length < 2) {
            return [attr];
          }
          const splitAttr = (entities || []).map((e) => {
            return {
              ...attr,
              optionGroupLabel: `${attr.attributeName} (${e})`,
              tags: (tags || []).filter((t) => t.entityName === e),
            };
          });
          return splitAttr;
        })
        .reduce((a, b) => [...a, ...b], []);

      formattedData.forEach((attr) => {
        if (attr.tags) {
          attr.tags.sort((a, b) => a.tagName.localeCompare(b.tagName));
        }
      });

      const [dataBasedAttrs, accessBasedAttrs] = (formattedData || []).reduce(
        (acc, attr) => {
          if (attr.attributeType === 'DATA') {
            acc[0].push(attr);
          } else {
            acc[1].push(attr);
          }
          return acc;
        },
        [[], []]
      );

      const userAttrIds = [...new Set((this.currentFleetInfo.userTags || []).map((t) => t.attributeId))];
      const userTagIds = (this.currentFleetInfo.userTags || []).map((t) => t.tagId);
      let allowedAccessBasedAttrs = [];

      if (userAttrIds.length) {
        allowedAccessBasedAttrs = accessBasedAttrs
          .filter((a) => userAttrIds.includes(a.attributeId))
          .map((a) => {
            const allowedTags = (a.tags || []).filter((t) => userTagIds.includes(t.tagId));
            this.allowedUserTags.push(...allowedTags);
            return {
              ...a,
              tags: allowedTags,
            };
          });
        if (!this.assignedTagList.length) {
          this.assignedTagList = [...this.allowedUserTags];
        }
      } else {
        allowedAccessBasedAttrs = [...accessBasedAttrs];
      }

      this.allAttrTagList = [...dataBasedAttrs, ...allowedAccessBasedAttrs];
      this.getAllTagsLoader = false;
      this.filteredAttribute = this.allAttrTagList;
      if (!this.isUserPage) {
        this.assignSelectedDropdownValue();
      }
      const allTags = this.filteredAttribute;
      this.store.dispatch(new UpdateTags({ allTags }));
      return allTags;
    } catch (error) {
      this.getAllTagsLoader = false;
      throw error;
    }
  }

  public assignSelectedDropdownValue() {
    this.ids = [];
    this.assignedTagList?.map((tag) => {
      this.ids.push(tag?.tagId);
    });
    this.tags.patchValue(this.ids);
  }

  getTooltip(tag: any): string | null {
    if (tag?.tagStatus === 'INACTIVE') {
      return this.translate.instant('DisabledTagToolTip');
    }
    return null;
  }
}
