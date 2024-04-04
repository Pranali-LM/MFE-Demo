import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestVideoComponent } from './request-video.component';

describe('RequestVideoComponent', () => {
  let component: RequestVideoComponent;
  let fixture: ComponentFixture<RequestVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestVideoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
