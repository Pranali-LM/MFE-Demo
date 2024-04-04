import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IncidentTrendComponent } from './incident-trend.component';

describe('IncidentTrendComponent', () => {
  let component: IncidentTrendComponent;
  let fixture: ComponentFixture<IncidentTrendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IncidentTrendComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
