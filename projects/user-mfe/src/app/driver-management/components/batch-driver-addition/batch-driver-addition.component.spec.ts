import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchDriverAdditionComponent } from './batch-driver-addition.component';

describe('BatchDriverAdditionComponent', () => {
  let component: BatchDriverAdditionComponent;
  let fixture: ComponentFixture<BatchDriverAdditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BatchDriverAdditionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchDriverAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
