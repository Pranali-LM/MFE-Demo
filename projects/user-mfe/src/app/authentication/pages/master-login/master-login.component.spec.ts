import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MasterLoginComponent } from './master-login.component';

describe('MasterLoginComponent', () => {
  let component: MasterLoginComponent;
  let fixture: ComponentFixture<MasterLoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MasterLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
