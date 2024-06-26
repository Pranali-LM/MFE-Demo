import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialCustomDateAdapter } from '@app-core/services/custom-date-adapters/material-custom-date-adapter';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatRadioModule } from '@angular/material/radio';
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';

@NgModule({
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatListModule,
    MatInputModule,
    MatGridListModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
    MatSelectModule,
    MatTooltipModule,
    MatSliderModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule,
    DragDropModule,
    MatBottomSheetModule,
    ScrollingModule,
    MatRadioModule,
  ],
  exports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatListModule,
    MatInputModule,
    MatGridListModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
    MatSelectModule,
    MatTooltipModule,
    MatSliderModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule,
    DragDropModule,
    MatBottomSheetModule,
    ScrollingModule,
    MatRadioModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MaterialCustomDateAdapter },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ],
  entryComponents: [MatProgressSpinner],
})
export class MaterialModule {}
