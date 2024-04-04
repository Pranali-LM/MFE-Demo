import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsListsComponent } from './sessions-lists.component';

describe('SessionsListsComponent', () => {
  let component: SessionsListsComponent;
  let fixture: ComponentFixture<SessionsListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionsListsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
