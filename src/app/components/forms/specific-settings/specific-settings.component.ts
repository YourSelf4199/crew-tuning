import { Component, OnInit } from '@angular/core';
import { SpecificSettings } from '../../../models/VehicleSpecificSettings/SpecificSettings';
import {
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

@Component({
  selector: 'app-specific-settings',
  imports: [FormsModule],
  templateUrl: './specific-settings.component.html',
  styleUrl: './specific-settings.component.css',
})
export class SpecificSettingsComponent implements OnInit {
  // Initialize the specificSettings model
  specificSettings: SpecificSettings = {
    aero_distribution: null,
    gearbox: null,
    tire_grip_front: null,
    tire_grip_rear: null,
    brake_power: null,
    brake_balance: null,
    susp_comp_front: null,
    susp_reb_front: null,
    susp_comp_rear: null,
    susp_reb_rear: null,
    susp_geom_camber_front: null,
    susp_geom_camber_rear: null,
    arb_front: null,
    arb_rear: null,
  };

  specificBoatSettings: Boats = {
    weight_distribution: null,
    rudder_angle: null,
    braking_power: null,
    buoyancy: null,
    hull_friction: null,
    trim_tabs: null,
  };

  selectedVehicle: {
    selectedVehicleType: string | null;
  };

  constructor(private store: Store) {
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
}
