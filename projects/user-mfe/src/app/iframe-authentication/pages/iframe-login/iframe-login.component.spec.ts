import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IframeLoginComponent } from './iframe-login.component';

describe('IframeLoginComponent', () => {
  let component: IframeLoginComponent;
  let fixture: ComponentFixture<IframeLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IframeLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
