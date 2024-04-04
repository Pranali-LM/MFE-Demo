import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomConfigurationsComponent } from './custom-configurations.component';

describe('CustomConfigurationsComponent', () => {
  let component: CustomConfigurationsComponent;
  let fixture: ComponentFixture<CustomConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomConfigurationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
