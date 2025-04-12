import { Component, OnInit, Signal } from '@angular/core';
import { SelectCarComponent } from '../../components/forms/select-car/select-car.component';
import { Store } from '@ngrx/store';
import {
  selectCurrentStep,
  selectHasGlobalSettings,
  selectHasSelectedVehicle,
  selectIsUpdatingConfiguration,
} from '../../store/vehicles/vehicles.selectors';
import { GlobalSettingsComponent } from '../../components/forms/global-settings/global-settings.component';
import { NgIf } from '@angular/common';
import { SpecificSettingsComponent } from '../../components/forms/specific-settings/specific-settings.component';

@Component({
  selector: 'app-add-car-tuning',
  imports: [SelectCarComponent, GlobalSettingsComponent, SpecificSettingsComponent, NgIf],
  templateUrl: './add-car-tuning.component.html',
  styleUrl: './add-car-tuning.component.css',
})
export class AddCarTuningComponent {
  hasSelectedVehicle: Signal<boolean>;
  hasGlobalSettings: Signal<boolean>;

  isUpdatingConfiguration: Signal<boolean>;
  currentStep: Signal<string>;

  constructor(private store: Store) {
    this.hasSelectedVehicle = this.store.selectSignal(selectHasSelectedVehicle);
    this.hasGlobalSettings = this.store.selectSignal(selectHasGlobalSettings);

    this.isUpdatingConfiguration = this.store.selectSignal(selectIsUpdatingConfiguration);
    this.currentStep = this.store.selectSignal(selectCurrentStep);
  }
}
