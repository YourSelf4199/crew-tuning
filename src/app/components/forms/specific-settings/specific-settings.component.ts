import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SpecificSettings } from '../../../models/VehicleSpecificSettings/SpecificSettings';
import {
  resetSelectedVehicle,
  setBoatSpecificSettings,
  setSpecificSettings,
  submitSelectedVehicle,
  updateVehicleConfiguration,
} from '../../../store/vehicles/vehicles.actions';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import {
  selectIsUpdatingConfiguration,
  selectSelectedVehicleIdAndType,
  selectSelectedVehicleState,
} from '../../../store/vehicles/vehicles.selectors';
import { Boats } from '../../../models/VehicleSpecificSettings/Boats';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-specific-settings',
  imports: [FormsModule, CommonModule],
  templateUrl: './specific-settings.component.html',
  styleUrl: './specific-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class SpecificSettingsComponent implements OnInit {
  // Initialize the specificSettings model
  specificSettings: SpecificSettings = {
    aero_distribution: 0,
    gearbox: 0,
    tire_grip_front: 0,
    tire_grip_rear: 0,
    brake_power: 0,
    brake_balance: 0,
    susp_comp_front: 0,
    susp_reb_front: 0,
    susp_comp_rear: 0,
    susp_reb_rear: 0,
    susp_geom_camber_front: 0,
    susp_geom_camber_rear: 0,
    arb_front: 0,
    arb_rear: 0,
  };

  specificBoatSettings: Boats = {
    weight_distribution: 0,
    rudder_angle: 0,
    braking_power: 0,
    buoyancy: 0,
    hull_friction: 0,
    trim_tabs: 0,
  };

  selectedVehicle: {
    selectedVehicleType: string | null;
  };

  constructor(
    private store: Store,
    private router: Router,
  ) {
    this.selectedVehicle = this.store.selectSignal(selectSelectedVehicleIdAndType)();
  }

  ngOnInit(): void {
    const selectedVehicle = this.store.selectSignal(selectSelectedVehicleState)();

    if (selectedVehicle?.specificSettings) {
      // ✅ Make a shallow copy to ensure ngModel binding is reactive
      this.specificSettings = { ...selectedVehicle.specificSettings };
    }
  }

  onSubmit() {
    if (this.store.selectSignal(selectIsUpdatingConfiguration)()) {
      const selectedVehicle = this.store.selectSignal(selectSelectedVehicleState)();

      if (
        selectedVehicle.selectedVehicleId &&
        selectedVehicle.globalSettings &&
        selectedVehicle.specificSettings
      ) {
        this.store.dispatch(
          updateVehicleConfiguration({
            selectedVehicleId: selectedVehicle.selectedVehicleId,
            globalSettings: selectedVehicle.globalSettings,
            specificSettings: this.specificSettings,
          }),
        );
      }
    } else {
      if (this.selectedVehicle?.selectedVehicleType === 'PB') {
        this.store.dispatch(
          setBoatSpecificSettings({ boatSpecificSettings: this.specificBoatSettings }),
        );
      } else {
        this.store.dispatch(setSpecificSettings({ specificSettings: this.specificSettings }));
      }

      this.store.dispatch(submitSelectedVehicle());
    }
  }

  cancelAction() {
    this.store.dispatch(resetSelectedVehicle());
    this.router.navigate(['/dashboard']);
  }
}
