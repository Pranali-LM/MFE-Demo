import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverQueryResultComponent } from './driver-query-result.component';

describe('DriverQueryResultComponent', () => {
  let component: DriverQueryResultComponent;
  let fixture: ComponentFixture<DriverQueryResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverQueryResultComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverQueryResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
