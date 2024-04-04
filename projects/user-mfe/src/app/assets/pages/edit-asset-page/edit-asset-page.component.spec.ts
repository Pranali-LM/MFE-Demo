import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssetPageComponent } from './edit-asset-page.component';

describe('EditAssetPageComponent', () => {
  let component: EditAssetPageComponent;
  let fixture: ComponentFixture<EditAssetPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAssetPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssetPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
