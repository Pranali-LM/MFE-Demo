import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActiveDriversComponent } from './active-drivers.component';

describe('ActiveDriversComponent', () => {
  let component: ActiveDriversComponent;
  let fixture: ComponentFixture<ActiveDriversComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ActiveDriversComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
