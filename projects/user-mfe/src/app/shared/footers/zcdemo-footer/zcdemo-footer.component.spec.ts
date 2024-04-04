import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZcdemoFooterComponent } from './zcdemo-footer.component';

describe('ZcdemoFooterComponent', () => {
  let component: ZcdemoFooterComponent;
  let fixture: ComponentFixture<ZcdemoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZcdemoFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZcdemoFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
