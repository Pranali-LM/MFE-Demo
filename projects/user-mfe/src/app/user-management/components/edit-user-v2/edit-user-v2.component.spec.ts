import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserV2Component } from './edit-user-v2.component';

describe('EditUserV2Component', () => {
  let component: EditUserV2Component;
  let fixture: ComponentFixture<EditUserV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditUserV2Component],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
