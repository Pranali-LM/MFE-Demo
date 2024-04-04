import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentStatsComponent } from './incident-stats.component';

describe('IncidentStatsComponent', () => {
  let component: IncidentStatsComponent;
  let fixture: ComponentFixture<IncidentStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IncidentStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
