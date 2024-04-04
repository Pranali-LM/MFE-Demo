import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FleetManagerLoginComponent } from './fleet-manager-login.component';

describe('FleetManagerLoginComponent', () => {
  let component: FleetManagerLoginComponent;
  let fixture: ComponentFixture<FleetManagerLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FleetManagerLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetManagerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
