import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggingFaqsComponent } from './tagging-faqs.component';

describe('TaggingFaqsComponent', () => {
  let component: TaggingFaqsComponent;
  let fixture: ComponentFixture<TaggingFaqsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaggingFaqsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggingFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
