import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  Signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  getUserVehicleConfigurations,
  loadTypesAndCategories,
  loadVehicles,
  resetSelectedVehicle,
  selectUserVehicleConfiguration,
} from '../../store/vehicles/vehicles.actions';
import {
  selectAllTypesAndCategories,
  selectAllVehicles,
  selectUserConfigurations,
} from '../../store/vehicles/vehicles.selectors';
import { VehicleConfigurations } from '../../models/VehicleConfigurations';
import { selectAuthStateFull } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  }

  cancelUpdateConfiguration() {
    this.selectedConfig = null;
  }
}
