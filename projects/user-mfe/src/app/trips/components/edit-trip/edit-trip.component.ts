import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { ManageAction } from '@app-asset-config/components/tagging/tagging.component';
import { TripsService } from '@app-trips/services/trips.service';
import { TripDetailsService } from '@app-trip-details/services/trip-details.service';
import { GetTripDetailsParams } from '@app-trip-details/common/trip-details.model';
import { DataService } from '@app-core/services/data/data.service';
import { SnackBarService } from '@app-core/services/snackbar/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['./edit-trip.component.scss'],
})
export class EditTripComponent implements OnInit {
  public actionName: ManageAction;
  public tripDetails: any;
  public tripDetailsLoader: boolean = false;
  public updateTagsLoader: boolean = false;
  public tripTags = [];
  public tripTagsIds = [];

  private driverId: string = '';
  private tripId: string = '';
  private tagList: any = [];

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private tripsService: TripsService,
    private tripDetailsService: TripDetailsService,
    private snackBarService: SnackBarService,
    public translate: TranslateService,
    public dataService: DataService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: any) => {
      const { action = '', tripId = '', driverId = '' } = params;
      this.actionName = action;
      this.driverId = driverId;
      this.tripId = tripId;
      this.getTripsTags();
    });
    if (this.tripsService?.tripDetails) {
      this.tripDetails = this.tripsService.tripDetails;
    } else {
      this.getTripDetails();
    }
  }

  public navigateBack() {
    this.location.back();
  }

  public selectedTags(tags: any) {
    this.tagList = tags;
  }

  public onSaveDetails() {
    this.updateTagsLoader = true;
    const body = {
      tripTags: this.tagList,
    };
    this.tripDetailsService
      .updateTagsToTrips(this.tripId, body)
      .pipe(
        finalize(() => {
          this.updateTagsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.snackBarService.success(this.translate.instant('editTripDialogueSuccess'));
          this.tripDetails = res;
          this.navigateBack();
        },
        () => {
          this.snackBarService.failure(this.translate.instant('editTripDialogueFailed'));
        }
      );
  }

  private getTripDetails() {
    this.tripDetailsLoader = true;
    const params = new GetTripDetailsParams({
      tripId: this.tripId,
      driverId: this.driverId,
    });
    this.tripDetailsService
      .getTripDetails(params)
      .pipe(
        finalize(() => {
          this.tripDetailsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.tripDetails = res;
        },
        () => {}
      );
  }

  private getTripsTags() {
    this.tripDetailsLoader = true;
    this.tripDetailsService
      .getTripsTags(this.tripId)
      .pipe(
        finalize(() => {
          this.tripDetailsLoader = false;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (res: any) => {
          this.tripTags = res.data?.tripTags;
        },
        () => {}
      );
  }
}
