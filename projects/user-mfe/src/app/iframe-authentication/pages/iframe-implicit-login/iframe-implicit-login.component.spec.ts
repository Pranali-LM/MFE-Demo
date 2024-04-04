import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeImplicitLoginComponent } from './iframe-implicit-login.component';

describe('IframeImplicitLoginComponent', () => {
  let component: IframeImplicitLoginComponent;
  let fixture: ComponentFixture<IframeImplicitLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IframeImplicitLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeImplicitLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
