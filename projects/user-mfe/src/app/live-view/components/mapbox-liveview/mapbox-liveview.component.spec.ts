import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboxLiveviewComponent } from './mapbox-liveview.component';

describe('MapboxLiveviewComponent', () => {
  let component: MapboxLiveviewComponent;
  let fixture: ComponentFixture<MapboxLiveviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapboxLiveviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapboxLiveviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
