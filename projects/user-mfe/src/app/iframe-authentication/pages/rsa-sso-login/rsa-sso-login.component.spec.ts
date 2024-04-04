import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RsaSsoLoginComponent } from './rsa-sso-login.component';

describe('RsaSsoLoginComponent', () => {
  let component: RsaSsoLoginComponent;
  let fixture: ComponentFixture<RsaSsoLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RsaSsoLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RsaSsoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
