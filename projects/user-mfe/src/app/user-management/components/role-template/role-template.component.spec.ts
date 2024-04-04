import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleTemplateComponent } from './role-template.component';

describe('RoleTemplateComponent', () => {
  let component: RoleTemplateComponent;
  let fixture: ComponentFixture<RoleTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RoleTemplateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
