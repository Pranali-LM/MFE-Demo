import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagConfirmationModalComponent } from './tag-confirmation-modal.component';

describe('TagConfirmationModalComponent', () => {
  let component: TagConfirmationModalComponent;
  let fixture: ComponentFixture<TagConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagConfirmationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
