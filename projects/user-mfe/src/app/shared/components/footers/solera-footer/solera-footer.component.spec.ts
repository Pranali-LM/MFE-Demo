import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoleraFooterComponent } from './solera-footer.component';

describe('SoleraFooterComponent', () => {
  let component: SoleraFooterComponent;
  let fixture: ComponentFixture<SoleraFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SoleraFooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoleraFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
