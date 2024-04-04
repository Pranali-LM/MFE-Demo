import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LivestreamModalComponent } from './livestream-modal.component';

describe('LivestreamModalComponent', () => {
  let component: LivestreamModalComponent;
  let fixture: ComponentFixture<LivestreamModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LivestreamModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LivestreamModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
