import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutsListComponent } from './shortcuts-list.component';

describe('ShortcutsListComponent', () => {
  let component: ShortcutsListComponent;
  let fixture: ComponentFixture<ShortcutsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShortcutsListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortcutsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
