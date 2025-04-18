import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() settingsChange = new EventEmitter<GlobalSettings>();
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  settings: GlobalSettings = {
    abs: 0,
    drift_assist: 0,
    esp: 0,
    traction_control: 0,
  };

  minValue = -10;
  maxValue = 10;

  onSettingsChange() {
    this.settingsChange.emit(this.settings);
  }

  onBack() {
    this.back.emit();
  }

  onNext() {
    this.next.emit();
  }
}
