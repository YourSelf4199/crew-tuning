import { Component, OnInit, ViewChild } from '@angular/core';
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
  vehicleImage: VehicleImage | null = null;
  isLoadingSettings: boolean = true;
  isSavingSettings: boolean = false;
  isEditing: boolean = false;
  //private configurationId: string | null = null;
  private globalSettingsId: string | null = null;
  private specificSettingsId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private vehicleConfigurationService: VehicleConfigurationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleImagesNamesId = parseInt(id, 10);
      this.loadConfiguration();
    }
  }

  loadConfiguration() {
    if (!this.vehicleImagesNamesId) return;

    this.isLoadingSettings = true;
    this.vehicleConfigurationService.getVehicleConfiguration(this.vehicleImagesNamesId).subscribe({
      next: (config) => {
        //this.configurationId = config.id;
        this.globalSettingsId = config.global_settings_id;
        this.specificSettingsId = config.specific_settings_id;
        this.globalSettings = config.vehicle_global_settings;
        this.specificSettings = config.vehicle_specific_settings;
        this.isLoadingSettings = false;
      },
      error: (error) => {
        console.error('Error loading configuration:', error);
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
    this.globalSettingsComponent.toggleEditMode();
    this.specificSettingsComponent.toggleEditMode();
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
                console.log('All settings updated successfully');
                //this.toggleEditMode();
                this.isSavingSettings = false;
                // Exit edit mode after saving
                this.router.navigate(['/app/dashboard']);
              },
              error: (error) => {
                console.error('Error updating specific settings:', error);
                this.isSavingSettings = false;
              },
            });
        },
        error: (error) => {
          console.error('Error updating global settings:', error);
          this.isSavingSettings = false;
        },
      });
  }
}
