import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisionDeviceComponent } from './provision-device.component';

describe('ProvisionDeviceComponent', () => {
  let component: ProvisionDeviceComponent;
  let fixture: ComponentFixture<ProvisionDeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProvisionDeviceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisionDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
