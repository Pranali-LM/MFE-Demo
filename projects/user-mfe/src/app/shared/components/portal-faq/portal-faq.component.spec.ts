import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalFaqComponent } from './portal-faq.component';

describe('PortalFaqComponent', () => {
  let component: PortalFaqComponent;
  let fixture: ComponentFixture<PortalFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PortalFaqComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
