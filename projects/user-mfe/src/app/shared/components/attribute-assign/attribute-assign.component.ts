import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TAGGING_CONTROL_TYPES } from '@app-asset-config/constants/tagging.constants';
import { TaggingService } from '@app-asset-config/services/tagging.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-attribute-assign',
  templateUrl: './attribute-assign.component.html',
  styleUrls: ['./attribute-assign.component.scss'],
})
export class AttributeAssignComponent implements OnInit, OnChanges {
  @Input() attributeType;
  @Input() dropDownType = 'assign';
  @Input() public rolesAttrList = [];
  @Input() public numOfAttributesToDisplay = 1;
  @Input() private isAccess;
  @Input() public isEntityEdit = false;
  @Input() public entityName = '';

  private allAttrList = [];

  @ViewChild('mySelect') mySelect;

  @Output() public selectedAttrIds: EventEmitter<any> = new EventEmitter();
  @Output() public assignedAttribute: EventEmitter<any> = new EventEmitter();

  public attributeControl = new FormControl();
  public isEditMode = false;
  public addAttributeLoader = true;
  public filteredAttribute: any[] = [];
  public allowedTypes = TAGGING_CONTROL_TYPES;
  public selectedAttrList = [];
  public getAttributesListLoader = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private ids = [];

  constructor(private taggingService: TaggingService, private translate: TranslateService) {}

  ngOnInit() {
    this.getAttributeList();
    this.attributeControl.valueChanges.subscribe((value: any) => {
      let selectAttrNames = [];
      value?.map((attrId) => {
        this.allAttrList?.map((attr) => {
          if (attr?.attributeId === attrId) {
            selectAttrNames.push(attr?.attributeName);
          }
        });
      });
      this.selectedAttrList = selectAttrNames;
      this.selectedAttrIds.emit(value);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.rolesAttrList && changes.rolesAttrList.currentValue) {
      this.rolesAttrList?.map((attr) => {
        this.selectedAttrList.push(attr?.attributeName);
        this.ids.push(attr?.attributeId);
        this.attributeControl.patchValue(this.ids);
      });
    }
  }

  onInputChange(event: any) {
    const searchInput = event.target.value.toLowerCase();
    let attrList = [];
    attrList = JSON.parse(JSON.stringify(this.allAttrList));
    this.filteredAttribute = attrList.filter((attr) => {
      const attrLower = attr.attributeName.toLowerCase();
      return attrLower.includes(searchInput);
    });
  }

  onOpenChange(searchInput: any) {
    searchInput.value = '';
    this.filteredAttribute = [...this.allAttrList];
  }

  public editMode() {
    this.isEditMode = true;
  }

  public doneMode() {
    this.isEditMode = false;
  }

  public getAttributeList() {
    this.getAttributesListLoader = true;
    const params = {
      limit: 100,
      offset: 0,
      // status: 'ACTIVE',
    };
    if (this.attributeType) {
      params['attributeType'] = this.attributeType;
    }
    if (this.isAccess) {
      params['isAccess'] = this.isAccess;
    }
    this.taggingService
      .getAttributes(params)
      .pipe(
        finalize(() => {
          this.getAttributesListLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any = {}) => {
          this.allAttrList = res?.data;
          if (this.isEntityEdit) {
            this.allAttrList.forEach((item) => {
              if (item.entities && item.entities.includes(this.entityName)) {
                this.rolesAttrList.push(item?.attributeId);
                this.selectedAttrList.push(item?.attributeName);
                if (item.entities.length < 2) {
                  item['isDisable'] = true;
                }
              } else {
                item['isDisable'] = false;
              }
            });
            this.attributeControl.patchValue(this.rolesAttrList);
            this.assignedAttribute.emit(this.rolesAttrList);
          }
          this.filteredAttribute = [...this.allAttrList];
        },
        () => {}
      );
  }

  getAttributeStatus(attr: any): string | null {
    if (attr?.status === 'INACTIVE') {
      return this.translate.instant('DisabledAttributeToolTip');
    } else if (this.isEntityEdit && attr?.entities?.length === 1 && attr?.isDisable) {
      return this.translate.instant('AttributeEntityDetachment');
    }
    return null;
  }
}
