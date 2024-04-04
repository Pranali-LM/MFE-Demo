import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDeviceComponent } from './manage-device.component';

describe('ManageDeviceComponent', () => {
  let component: ManageDeviceComponent;
  let fixture: ComponentFixture<ManageDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageDeviceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
