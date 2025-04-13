import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  deleteVehicleConfiguration,
  selectUserVehicleConfiguration,
} from '../../store/vehicles/vehicles.actions';
import { selectUserConfigurations } from '../../store/vehicles/vehicles.selectors';
import { VehicleConfigurations } from '../../models/VehicleConfigurations';
import { ViewGlobalSettingsComponent } from '../../components/view-global-settings/view-global-settings.component';
import { ViewSpecificSettingsComponent } from '../../components/view-specific-settings/view-specific-settings.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule, ViewGlobalSettingsComponent, ViewSpecificSettingsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  vehicleConfigurations: VehicleConfigurations[] = [];
  selectedConfigId: number | null = null;

  constructor(
    private store: Store,
    private router: Router,
  ) {
    this.store.select(selectUserConfigurations).subscribe((configurations) => {
      this.vehicleConfigurations = configurations;
    });
  }

  selectConfiguration(config: VehicleConfigurations) {
    this.store.dispatch(selectUserVehicleConfiguration({ vehicleConfiguration: config }));
    this.router.navigate(['/add-car-tuning']); // Adjust route as needed
  }

  // Check for yellow codes
  isYellowCode(code: string) {
    return code === 'SR' || code === 'HC' || code === 'DF' || code === 'DG';
  }

  // Check for blue codes
  isBlueCode(code: string): boolean {
    return code === 'TC' || code === 'PB' || code === 'A' || code === 'AR';
  }

  selectedConfig: any = null;

  onCardClick(config: any) {
    this.selectedConfig = config;
    console.log(config);
  }

  closePopUp() {
    this.selectedConfig = null;
  }

  deleteConfiguration(config: VehicleConfigurations) {
    this.store.dispatch(deleteVehicleConfiguration({ vehicleId: config.imageAndName.id }));
    this.closePopUp();
  }
}
