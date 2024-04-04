import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyDriverStatsComponent } from './legacy-driver-stats.component';

describe('LegacyDriverStatsComponent', () => {
  let component: LegacyDriverStatsComponent;
  let fixture: ComponentFixture<LegacyDriverStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegacyDriverStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegacyDriverStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
