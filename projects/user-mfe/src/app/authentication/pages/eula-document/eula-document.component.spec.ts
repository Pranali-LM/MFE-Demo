import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EulaDocumentComponent } from './eula-document.component';

describe('EulaDocumentComponent', () => {
  let component: EulaDocumentComponent;
  let fixture: ComponentFixture<EulaDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EulaDocumentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EulaDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
