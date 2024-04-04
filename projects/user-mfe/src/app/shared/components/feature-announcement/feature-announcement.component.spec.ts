import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeatureAnnouncementComponent } from './feature-announcement.component';

describe('FeaturePreviewComponent', () => {
  let component: FeatureAnnouncementComponent;
  let fixture: ComponentFixture<FeatureAnnouncementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureAnnouncementComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureAnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
