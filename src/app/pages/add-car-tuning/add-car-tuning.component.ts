import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, VehicleImage, VehicleType } from '../../models/vehicle.model';
import { GlobalSettings, SpecificSettings } from '../../models/settings.model';
import { SelectVehicleComponent } from '../../components/add-vehicle/select-vehicle/select-vehicle.component';
import { GlobalSettingsComponent } from '../../components/add-vehicle/global-settings/global-settings.component';
import { SpecificSettingsComponent } from '../../components/add-vehicle/specific-settings/specific-settings.component';
import { VehicleConfigurationService } from '../../services/vehicle-configuration.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-car-tuning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectVehicleComponent,
    GlobalSettingsComponent,
    SpecificSettingsComponent,
  ],
  templateUrl: './add-car-tuning.component.html',
  styleUrls: ['./add-car-tuning.component.css'],
})
export class AddCarTuningComponent {
  @ViewChild(SpecificSettingsComponent) specificSettingsComponent!: SpecificSettingsComponent;

  vehicleImages: Vehicle[] = [];
  selectedVehicle: VehicleImage | null = null;
  showGlobalSettings = false;
  showSpecificSettings = false;
  isLoading = true;
  error: string | null = null;
  private failedImages = new Set<string>();

  globalSettings: GlobalSettings = {
    abs: 0,
    drift_assist: 0,
    esp: 0,
    traction_control: 0,
  };

  specificSettings: SpecificSettings = {
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

  constructor(
    private vehicleService: VehicleService,
    private vehicleConfigurationService: VehicleConfigurationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadVehicleImages();
  }

  private loadVehicleImages(): void {
    this.vehicleService.getVehicleImages().subscribe({
      next: (images) => {
        this.vehicleImages = images;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicle images';
        this.isLoading = false;
        console.error('Error loading vehicle images:', err);
      },
    });
  }

  async onVehicleSelected(vehicle: Vehicle) {
    this.selectedVehicle = vehicle.vehicleImage;
    this.showGlobalSettings = true;
  }

  async onSaveSettings(): Promise<void> {
    if (!this.selectedVehicle) {
      console.error('No vehicle selected');
      return;
    }

    try {
      const session = await this.authService.getCurrentSession();
      const cognitoSubId = session.userSub;
      if (!cognitoSubId) {
        console.error('No cognito sub ID found');
        return;
      }

      // First, get the vehicle type ID
      const vehicleTypes = await this.vehicleService.getVehicleTypes().toPromise();
      const vehicleType = vehicleTypes?.find(
        (type: VehicleType) => type.code === this.selectedVehicle?.vehicle_type_code,
      );

      if (!vehicleType) {
        console.error('No matching vehicle type found');
        return;
      }

      // Then, insert global settings
      this.vehicleConfigurationService.insertGlobalSettings(this.globalSettings).subscribe({
        next: (globalResult) => {
          const globalSettingsId = globalResult.data?.insert_vehicle_global_settings_one?.id;
          if (!globalSettingsId) {
            console.error('Failed to get global settings ID');
            return;
          }

          // Then, insert specific settings
          this.vehicleConfigurationService.insertSpecificSettings(this.specificSettings).subscribe({
            next: (specificResult) => {
              const specificSettingsId =
                specificResult.data?.insert_vehicle_specific_settings_one?.id;
              if (!specificSettingsId) {
                console.error('Failed to get specific settings ID');
                return;
              }

              // Finally, insert vehicle configuration
              this.vehicleConfigurationService
                .insertVehicleConfiguration({
                  vehicle_images_names_id: this.selectedVehicle!.id,
                  vehicle_types_id: vehicleType.id,
                  cognito_sub_id: cognitoSubId,
                  global_settings_id: globalSettingsId,
                  specific_settings_id: specificSettingsId,
                })
                .subscribe({
                  next: (configResult) => {
                    console.log('Configuration saved successfully:', configResult);
                    this.router.navigate(['/app/dashboard']);
                  },
                  error: (err) => {
                    console.error('Error saving vehicle configuration:', err);
                    this.specificSettingsComponent.isLoading = false;
                  },
                  complete: () => {
                    this.specificSettingsComponent.isLoading = false;
                  },
                });
            },
            error: (err) => {
              console.error('Error saving specific settings:', err);
              this.specificSettingsComponent.isLoading = false;
            },
          });
        },
        error: (err) => {
          console.error('Error saving global settings:', err);
          this.specificSettingsComponent.isLoading = false;
        },
      });
    } catch (error) {
      console.error('Error getting user session:', error);
      this.specificSettingsComponent.isLoading = false;
    }
  }

  onBack(): void {
    if (this.showSpecificSettings) {
      this.showSpecificSettings = false;
      this.showGlobalSettings = true;
    } else {
      this.showGlobalSettings = false;
      this.selectedVehicle = null;
    }
  }

  onNext(): void {
    this.showGlobalSettings = false;
    this.showSpecificSettings = true;
  }

  onGlobalSettingsChanged(settings: GlobalSettings): void {
    this.globalSettings = settings;
  }

  onSpecificSettingsChanged(settings: SpecificSettings): void {
    this.specificSettings = settings;
  }
}
