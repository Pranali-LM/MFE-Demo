import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioConsentComponent } from './audio-consent.component';

describe('AudioConsentComponent', () => {
  let component: AudioConsentComponent;
  let fixture: ComponentFixture<AudioConsentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AudioConsentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
