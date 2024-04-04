import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectFleetComponent } from './select-fleet.component';

describe('SelectFleetComponent', () => {
  let component: SelectFleetComponent;
  let fixture: ComponentFixture<SelectFleetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectFleetComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFleetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
