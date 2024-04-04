import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchProvisionComponent } from './batch-provision.component';

describe('BatchProvisionComponent', () => {
  let component: BatchProvisionComponent;
  let fixture: ComponentFixture<BatchProvisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BatchProvisionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
