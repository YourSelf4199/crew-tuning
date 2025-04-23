import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSettingsComponent implements OnChanges {
  @Input() selectedVehicle!: VehicleImage;
  @Input() isReadOnly = false;
  @Input() settings?: GlobalSettings;
  @Output() settingsChange = new EventEmitter<GlobalSettings>();
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isReadOnly'] && !this.isReadOnly && this.settings) {
      this._settings = { ...this.settings };
      this.cdr.markForCheck();
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
