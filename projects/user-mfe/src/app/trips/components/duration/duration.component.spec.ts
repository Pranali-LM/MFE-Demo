import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DurationComponent } from './duration.component';

describe('DurationComponent', () => {
  let component: DurationComponent;
  let fixture: ComponentFixture<DurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DurationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
