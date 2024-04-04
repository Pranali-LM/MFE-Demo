import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BookmarkedVideosComponent } from './bookmarked-videos.component';

describe('BookmarkedVideosComponent', () => {
  let component: BookmarkedVideosComponent;
  let fixture: ComponentFixture<BookmarkedVideosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BookmarkedVideosComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkedVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
