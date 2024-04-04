import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedSessionListComponent } from './completed-session-list.component';

describe('CompletedSessionListComponent', () => {
  let component: CompletedSessionListComponent;
  let fixture: ComponentFixture<CompletedSessionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletedSessionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedSessionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
