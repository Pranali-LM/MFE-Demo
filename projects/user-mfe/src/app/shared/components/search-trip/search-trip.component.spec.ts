import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchTripComponent } from './search-trip.component';

describe('SearchTripComponent', () => {
  let component: SearchTripComponent;
  let fixture: ComponentFixture<SearchTripComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchTripComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
