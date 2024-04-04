import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveDriverDurationComponent } from './active-driver-duration.component';

describe('ActiveDriverDurationComponent', () => {
  let component: ActiveDriverDurationComponent;
  let fixture: ComponentFixture<ActiveDriverDurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveDriverDurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveDriverDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
