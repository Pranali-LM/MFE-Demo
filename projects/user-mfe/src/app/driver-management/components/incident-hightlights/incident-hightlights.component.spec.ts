import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentHightlightsComponent } from './incident-hightlights.component';

describe('IncidentHightlightsComponent', () => {
  let component: IncidentHightlightsComponent;
  let fixture: ComponentFixture<IncidentHightlightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncidentHightlightsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentHightlightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
