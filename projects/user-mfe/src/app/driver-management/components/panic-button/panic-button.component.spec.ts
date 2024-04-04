import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanicButtonComponent } from './panic-button.component';

describe('PanicButtonComponent', () => {
  let component: PanicButtonComponent;
  let fixture: ComponentFixture<PanicButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PanicButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanicButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
