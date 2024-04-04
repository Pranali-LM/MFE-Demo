import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdvrConfigComponent } from './mdvr-config.component';

describe('MdvrConfigComponent', () => {
  let component: MdvrConfigComponent;
  let fixture: ComponentFixture<MdvrConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MdvrConfigComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MdvrConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
