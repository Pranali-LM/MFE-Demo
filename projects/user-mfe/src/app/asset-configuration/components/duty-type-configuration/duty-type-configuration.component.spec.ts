import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DutyTypeConfigurationComponent } from './duty-type-configuration.component';

describe('DutyTypeConfigurationComponent', () => {
  let component: DutyTypeConfigurationComponent;
  let fixture: ComponentFixture<DutyTypeConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DutyTypeConfigurationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DutyTypeConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
