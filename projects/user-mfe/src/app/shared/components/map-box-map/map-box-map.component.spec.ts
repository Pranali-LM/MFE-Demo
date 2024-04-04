import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBoxMapComponent } from './map-box-map.component';

describe('MapBoxMapComponent', () => {
  let component: MapBoxMapComponent;
  let fixture: ComponentFixture<MapBoxMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapBoxMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapBoxMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
