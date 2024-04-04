import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAttributeComponent } from './assign-attribute.component';

describe('AssignAttributeComponent', () => {
  let component: AssignAttributeComponent;
  let fixture: ComponentFixture<AssignAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignAttributeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
