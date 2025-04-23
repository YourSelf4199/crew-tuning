import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleConfigurationService } from '../../services/vehicle-configuration.service';
import { GlobalSettingsComponent } from '../../components/add-vehicle/global-settings/global-settings.component';
import { SpecificSettingsComponent } from '../../components/add-vehicle/specific-settings/specific-settings.component';
import { GlobalSettings, SpecificSettings } from '../../models/settings.model';
import { VehicleImage } from '../../models/vehicle.model';

@Component({
  selector: 'app-view-car-tuning',
  standalone: true,
  imports: [CommonModule, GlobalSettingsComponent, SpecificSettingsComponent],
  templateUrl: './view-car-tuning.component.html',
})
export class ViewCarTuningComponent implements OnInit {
  @ViewChild(GlobalSettingsComponent) globalSettingsComponent!: GlobalSettingsComponent;
  @ViewChild(SpecificSettingsComponent) specificSettingsComponent!: SpecificSettingsComponent;

  globalSettings: GlobalSettings | undefined;
  specificSettings: SpecificSettings | undefined;
  vehicleImagesNamesId: number | null = null;
  vehicleImagesName: string | null = null;
  vehicleImage: VehicleImage | null = null;
  isLoadingSettings: boolean = true;
  isSavingSettings: boolean = false;
  isEditing: boolean = false;
  private globalSettingsId: string | null = null;
  private specificSettingsId: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private vehicleConfigurationService: VehicleConfigurationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const name = this.route.snapshot.paramMap.get('name');
    if (id && name) {
      this.vehicleImagesNamesId = parseInt(id, 10);
      this.vehicleImagesName = name;
      this.loadConfiguration();
    }
  }

  loadConfiguration() {
    if (!this.vehicleImagesNamesId) return;

    this.isLoadingSettings = true;
    this.vehicleConfigurationService.getVehicleConfiguration(this.vehicleImagesNamesId).subscribe({
      next: (config) => {
        this.globalSettingsId = config.global_settings_id;
        this.specificSettingsId = config.specific_settings_id;
        this.globalSettings = config.vehicle_global_settings;
        this.specificSettings = config.vehicle_specific_settings;
        this.isLoadingSettings = false;
      },
      error: (error) => {
        this.error = 'Error loading configuration';
        this.isLoadingSettings = false;
      },
    });
  }

  onGlobalSettingsChanged(settings: GlobalSettings) {
    this.globalSettings = settings;
  }

  onSpecificSettingsChanged(settings: SpecificSettings) {
    this.specificSettings = settings;
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  saveSettings() {
    if (
      !this.globalSettingsId ||
      !this.specificSettingsId ||
      !this.globalSettings ||
      !this.specificSettings
    ) {
      return;
    }

    this.isSavingSettings = true;

    // Update global settings
    this.vehicleConfigurationService
      .updateGlobalSettings(this.globalSettingsId, this.globalSettings)
      .subscribe({
        next: () => {
          // Update specific settings after global settings are updated
          this.vehicleConfigurationService
            .updateSpecificSettings(this.specificSettingsId!, this.specificSettings!)
            .subscribe({
              next: () => {
                this.isSavingSettings = false;
                this.router.navigate(['/app/dashboard']);
              },
              error: (error) => {
                this.error = 'Error updating specific settings, sorry for the inconvenience';
                this.isSavingSettings = false;
              },
            });
        },
        error: (error) => {
          this.error = 'Error updating global settings, sorry for the inconvenience';
          this.isSavingSettings = false;
        },
      });
  }
}
