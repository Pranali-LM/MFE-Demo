import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BasicConfigurationsComponent } from './basic-configurations.component';

describe('BasicConfigurationsComponent', () => {
  let component: BasicConfigurationsComponent;
  let fixture: ComponentFixture<BasicConfigurationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BasicConfigurationsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
