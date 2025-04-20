import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleImage } from '../../../models/vehicle.model';
import { SpecificSettings } from '../../../models/settings.model';

@Component({
  selector: 'app-specific-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './specific-settings.component.html',
  styleUrls: ['./specific-settings.component.css'],
})
export class SpecificSettingsComponent {
  @Input() selectedVehicle!: VehicleImage;
  @Input() isReadOnly = false;
  @Input() settings?: SpecificSettings;
  @Output() settingsChange = new EventEmitter<SpecificSettings>();
  @Output() save = new EventEmitter<SpecificSettings>();
  @Output() back = new EventEmitter<void>();

  private _settings: SpecificSettings = {
    aero_distribution: 0,
    arb_front: 0,
    arb_rear: 0,
    brake_balance: 0,
    brake_power: 0,
    gearbox: 0,
    susp_comp_front: 0,
    susp_comp_rear: 0,
    susp_geom_camber_front: 0,
    susp_geom_camber_rear: 0,
    susp_reb_front: 0,
    susp_reb_rear: 0,
    tire_grip_front: 0,
    tire_grip_rear: 0,
  };

  get currentSettings(): SpecificSettings {
    return this.isReadOnly ? this.settings || this._settings : this._settings;
  }

  minValue = -10;
  maxValue = 10;

  isLoading = false;

  toggleEditMode() {
    this.isReadOnly = !this.isReadOnly;
    if (!this.isReadOnly && this.settings) {
      // When entering edit mode, create a copy of the input settings
      this._settings = { ...this.settings };
    }
  }

  onSettingsChange() {
    if (!this.isReadOnly) {
      this.settingsChange.emit(this._settings);
    }
  }

  onBack() {
    this.back.emit();
  }

  onSave() {
    if (!this.isReadOnly) {
      this.isLoading = true;
      this.save.emit(this._settings);
    }
  }
}
