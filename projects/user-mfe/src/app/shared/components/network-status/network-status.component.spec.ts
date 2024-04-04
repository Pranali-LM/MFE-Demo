import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NetworkStatusComponent } from './network-status.component';

describe('NetworkStatusComponent', () => {
  let component: NetworkStatusComponent;
  let fixture: ComponentFixture<NetworkStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkStatusComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
