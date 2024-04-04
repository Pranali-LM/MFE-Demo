import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndSessionConfirmationComponent } from './end-session-confirmation.component';

describe('EndSessionConfirmationComponent', () => {
  let component: EndSessionConfirmationComponent;
  let fixture: ComponentFixture<EndSessionConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EndSessionConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndSessionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
