import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorProfileComponent } from './sensor-profile.component';

describe('SensorProfileComponent', () => {
  let component: SensorProfileComponent;
  let fixture: ComponentFixture<SensorProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SensorProfileComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
