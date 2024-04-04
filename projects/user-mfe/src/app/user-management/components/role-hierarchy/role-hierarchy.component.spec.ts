import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleHierarchyComponent } from './role-hierarchy.component';

describe('RoleHierarchyComponent', () => {
  let component: RoleHierarchyComponent;
  let fixture: ComponentFixture<RoleHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RoleHierarchyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
