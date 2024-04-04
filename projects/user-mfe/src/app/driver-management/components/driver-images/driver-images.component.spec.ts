import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DriverImagesComponent } from './driver-images.component';

describe('DriverImagesComponent', () => {
  let component: DriverImagesComponent;
  let fixture: ComponentFixture<DriverImagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DriverImagesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
