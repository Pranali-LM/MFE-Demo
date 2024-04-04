import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDetailsModalComponent } from './asset-details-modal.component';

describe('AssetDetailsModalComponent', () => {
  let component: AssetDetailsModalComponent;
  let fixture: ComponentFixture<AssetDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetDetailsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
