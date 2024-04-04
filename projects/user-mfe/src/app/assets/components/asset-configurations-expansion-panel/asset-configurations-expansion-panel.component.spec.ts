import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetConfigurationsExpansionPanelComponent } from './asset-configurations-expansion-panel.component';

describe('ConfigurationsExpansionPanelComponent', () => {
  let component: AssetConfigurationsExpansionPanelComponent;
  let fixture: ComponentFixture<AssetConfigurationsExpansionPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssetConfigurationsExpansionPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetConfigurationsExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
