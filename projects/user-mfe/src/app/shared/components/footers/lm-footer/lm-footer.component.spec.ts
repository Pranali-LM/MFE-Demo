import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LmFooterComponent } from './lm-footer.component';

describe('LmFooterComponent', () => {
  let component: LmFooterComponent;
  let fixture: ComponentFixture<LmFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LmFooterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LmFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
