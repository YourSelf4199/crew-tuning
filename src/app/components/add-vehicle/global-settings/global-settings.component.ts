import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleImage } from '../../../models/vehicle.model';
import { GlobalSettings } from '../../../models/settings.model';

@Component({
  selector: 'app-global-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.css'],
})
export class GlobalSettingsComponent {
  @Input() selectedVehicle!: VehicleImage;
  @Input() isReadOnly = false;
  @Input() settings?: GlobalSettings;
  @Output() settingsChange = new EventEmitter<GlobalSettings>();
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  private _settings: GlobalSettings = {
    abs: 0,
    drift_assist: 0,
    esp: 0,
    traction_control: 0,
  };

  get currentSettings(): GlobalSettings {
    return this.isReadOnly ? this.settings || this._settings : this._settings;
  }

  minValue = -10;
  maxValue = 10;

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

  onNext() {
    if (!this.isReadOnly) {
      this.next.emit();
    }
  }
}
