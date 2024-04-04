import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsOnboardingComponent } from './tags-onboarding.component';

describe('TagsOnboardingComponent', () => {
  let component: TagsOnboardingComponent;
  let fixture: ComponentFixture<TagsOnboardingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TagsOnboardingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
