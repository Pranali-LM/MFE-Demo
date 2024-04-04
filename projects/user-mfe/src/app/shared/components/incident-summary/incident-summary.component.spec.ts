import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentSummaryComponent } from './incident-summary.component';

describe('IncidentSummaryComponent', () => {
  let component: IncidentSummaryComponent;
  let fixture: ComponentFixture<IncidentSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IncidentSummaryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
