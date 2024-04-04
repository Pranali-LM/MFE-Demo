import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeAssignComponent } from './attribute-assign.component';

describe('AttributeAssignComponent', () => {
  let component: AttributeAssignComponent;
  let fixture: ComponentFixture<AttributeAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttributeAssignComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
