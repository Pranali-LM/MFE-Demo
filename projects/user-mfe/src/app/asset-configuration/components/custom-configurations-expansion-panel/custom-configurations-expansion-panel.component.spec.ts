import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomConfigurationsExpansionPanelComponent } from './custom-configurations-expansion-panel.component';

describe('CustomConfigurationsExpansionPanelComponent', () => {
  let component: CustomConfigurationsExpansionPanelComponent;
  let fixture: ComponentFixture<CustomConfigurationsExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomConfigurationsExpansionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomConfigurationsExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
