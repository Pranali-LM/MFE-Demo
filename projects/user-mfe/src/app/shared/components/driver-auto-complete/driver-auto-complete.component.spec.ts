import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverAutoCompleteComponent } from './driver-auto-complete.component';

describe('DriverAutoCompleteComponent', () => {
  let component: DriverAutoCompleteComponent;
  let fixture: ComponentFixture<DriverAutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DriverAutoCompleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverAutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
