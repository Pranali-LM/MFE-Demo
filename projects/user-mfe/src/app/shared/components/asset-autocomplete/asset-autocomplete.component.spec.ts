import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetAutocompleteComponent } from './asset-autocomplete.component';

describe('AssetAutocompleteComponent', () => {
  let component: AssetAutocompleteComponent;
  let fixture: ComponentFixture<AssetAutocompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AssetAutocompleteComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
