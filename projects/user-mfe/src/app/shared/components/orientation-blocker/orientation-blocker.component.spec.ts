import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrientationBlockerComponent } from './orientation-blocker.component';

describe('OrientationBlockerComponent', () => {
  let component: OrientationBlockerComponent;
  let fixture: ComponentFixture<OrientationBlockerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrientationBlockerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrientationBlockerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
