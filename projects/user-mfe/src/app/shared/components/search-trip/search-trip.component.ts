import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-trip',
  templateUrl: './search-trip.component.html',
  styleUrls: ['./search-trip.component.scss'],
})
export class SearchTripComponent {
  public tripId = new FormControl('');

  constructor(private router: Router) {}

  public onTripSearch() {
    const tripId = this.tripId.value.trim();
    if (!tripId) {
      return;
    }
    this.router.navigate(['/trip-details'], {
      queryParams: {
        tripId,
      },
    });
    this.clearForm();
  }

  public clearForm() {
    this.tripId.reset();
  }
}
