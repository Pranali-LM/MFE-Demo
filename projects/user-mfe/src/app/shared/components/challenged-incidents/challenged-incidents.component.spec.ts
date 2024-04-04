import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengedIncidentsComponent } from './challenged-incidents.component';

describe('ChallengedIncidentsComponent', () => {
  let component: ChallengedIncidentsComponent;
  let fixture: ComponentFixture<ChallengedIncidentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallengedIncidentsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengedIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
