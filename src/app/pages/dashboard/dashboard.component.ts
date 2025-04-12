import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit, Signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
})
export class DashboardComponent {
  vehicleConfigurations: Signal<VehicleConfigurations[]> | undefined;

  constructor(
    private authService: AuthService,
    private store: Store,
    private router: Router,
  ) {
    this.store.select(selectAllVehicles).subscribe((vehicles) => {
      if (vehicles.length === 0) {
        this.store.dispatch(loadVehicles());
      }
    });

    const types = this.store.selectSignal(selectAllTypesAndCategories)();
    if (types.length === 0) {
      this.store.dispatch(loadTypesAndCategories());
    }

    const authState = this.store.selectSignal(selectAuthStateFull);
    this.store.dispatch(getUserVehicleConfigurations({ userId: authState().userId }));
    this.vehicleConfigurations = computed(() =>
      this.store.selectSignal(selectUserConfigurations)(),
    );
  }

  isMenuOpen = true;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleSignOut() {
    this.authService.signOut();
  }

  selectConfiguration(config: VehicleConfigurations) {
    this.store.dispatch(selectUserVehicleConfiguration({ vehicleConfiguration: config }));
    this.router.navigate(['/dashboard/add-car-tuning']); // Adjust route as needed
  }

  cancelUpdateConfiguration() {
    this.store.dispatch(resetSelectedVehicle());
  }
}
