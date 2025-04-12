import { Component, OnInit } from '@angular/core';
import { GlobalSettings } from '../../../models/VehicleGlobalSettings/GlobalSettings';
import { Store } from '@ngrx/store';
import { goToSpecificSettings, setGlobalSettings } from '../../../store/vehicles/vehicles.actions';
import { FormsModule } from '@angular/forms';
import {
  selectSelectedVehicleIdAndType,
  selectSelectedVehicleState,
} from '../../../store/vehicles/vehicles.selectors';

@Component({
  selector: 'app-global-settings',
  imports: [FormsModule],
  templateUrl: './global-settings.component.html',
  styleUrl: './global-settings.component.css',
})
export class GlobalSettingsComponent implements OnInit {
  globalSettings: GlobalSettings = {
    traction_control: null,
    abs: null,
    esp: null,
    drift_assist: null,
  };

  selectedVehicle: {
    selectedVehicleType: string | null;
  };

  constructor(private store: Store) {
    this.selectedVehicle = this.store.selectSignal(selectSelectedVehicleIdAndType)();
  }

  ngOnInit(): void {
    const selectedVehicle = this.store.selectSignal(selectSelectedVehicleState)();

    if (selectedVehicle?.globalSettings) {
      // ✅ Make a shallow copy to ensure ngModel binding is reactive
      this.globalSettings = { ...selectedVehicle.globalSettings };
    }
  }

  onSubmit() {
    this.store.dispatch(setGlobalSettings({ globalSettings: this.globalSettings }));
    this.store.dispatch(goToSpecificSettings());
  }
}
