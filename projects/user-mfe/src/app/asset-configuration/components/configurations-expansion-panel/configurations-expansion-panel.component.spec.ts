import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigurationsExpansionPanelComponent } from './configurations-expansion-panel.component';

describe('ConfigurationsExpansionPanelComponent', () => {
  let component: ConfigurationsExpansionPanelComponent;
  let fixture: ComponentFixture<ConfigurationsExpansionPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigurationsExpansionPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationsExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
