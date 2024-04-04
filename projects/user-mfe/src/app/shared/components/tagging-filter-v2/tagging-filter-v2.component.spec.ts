import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggingFilterV2Component } from './tagging-filter-v2.component';

describe('TaggingFilterV2Component', () => {
  let component: TaggingFilterV2Component;
  let fixture: ComponentFixture<TaggingFilterV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaggingFilterV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(TaggingFilterV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
