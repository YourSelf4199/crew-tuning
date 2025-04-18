import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() settingsChange = new EventEmitter<SpecificSettings>();
  @Output() save = new EventEmitter<SpecificSettings>();
  @Output() back = new EventEmitter<void>();

  @Input() settings: SpecificSettings = {
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

  minValue = -10;
  maxValue = 10;

  isLoading = false;

  onSettingsChange() {
    this.settingsChange.emit(this.settings);
  }

  onBack() {
    this.back.emit();
  }

  onSave() {
    this.isLoading = true;
    this.save.emit(this.settings);
  }
}
