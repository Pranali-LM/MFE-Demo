import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguartionFaqComponent } from './configuartion-faq.component';

describe('ConfiguartionFaqComponent', () => {
  let component: ConfiguartionFaqComponent;
  let fixture: ComponentFixture<ConfiguartionFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfiguartionFaqComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguartionFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
