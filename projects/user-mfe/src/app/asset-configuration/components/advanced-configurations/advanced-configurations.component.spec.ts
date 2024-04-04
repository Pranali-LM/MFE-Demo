import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvancedConfigurationsComponent } from './advanced-configurations.component';

describe('AdvancedConfigurationsComponent', () => {
  let component: AdvancedConfigurationsComponent;
  let fixture: ComponentFixture<AdvancedConfigurationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedConfigurationsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
