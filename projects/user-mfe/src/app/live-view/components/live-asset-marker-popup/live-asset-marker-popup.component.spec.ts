import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiveAssetMarkerPopupComponent } from './live-asset-marker-popup.component';

describe('LiveAssetMarkerPopupComponent', () => {
  let component: LiveAssetMarkerPopupComponent;
  let fixture: ComponentFixture<LiveAssetMarkerPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LiveAssetMarkerPopupComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveAssetMarkerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
