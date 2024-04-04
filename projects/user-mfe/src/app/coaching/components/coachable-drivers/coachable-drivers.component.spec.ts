import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachableDriversComponent } from './coachable-drivers.component';

describe('CoachableDriversComponent', () => {
  let component: CoachableDriversComponent;
  let fixture: ComponentFixture<CoachableDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoachableDriversComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachableDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
