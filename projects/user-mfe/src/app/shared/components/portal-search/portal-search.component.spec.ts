import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalSearchComponent } from './portal-search.component';

describe('PortalSearchComponent', () => {
  let component: PortalSearchComponent;
  let fixture: ComponentFixture<PortalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalSearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
