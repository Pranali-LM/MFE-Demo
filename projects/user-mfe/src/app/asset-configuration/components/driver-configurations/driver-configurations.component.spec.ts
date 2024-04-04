import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverConfigurationsComponent } from './driver-configurations.component';

describe('DriverConfigurationsComponent', () => {
  let component: DriverConfigurationsComponent;
  let fixture: ComponentFixture<DriverConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverConfigurationsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
