import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnrollmentFaqComponent } from './enrollment-faq.component';

describe('EnrollmentFaqComponent', () => {
  let component: EnrollmentFaqComponent;
  let fixture: ComponentFixture<EnrollmentFaqComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnrollmentFaqComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
