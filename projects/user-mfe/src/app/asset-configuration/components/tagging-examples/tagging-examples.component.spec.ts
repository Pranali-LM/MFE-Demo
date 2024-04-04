import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggingExamplesComponent } from './tagging-examples.component';

describe('TaggingExamplesComponent', () => {
  let component: TaggingExamplesComponent;
  let fixture: ComponentFixture<TaggingExamplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaggingExamplesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggingExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
