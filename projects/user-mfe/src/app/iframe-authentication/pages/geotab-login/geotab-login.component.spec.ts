import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeotabLoginComponent } from './geotab-login.component';

describe('GeotabLoginComponent', () => {
  let component: GeotabLoginComponent;
  let fixture: ComponentFixture<GeotabLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GeotabLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeotabLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
