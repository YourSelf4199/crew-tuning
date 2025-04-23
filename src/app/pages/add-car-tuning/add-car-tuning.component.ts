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
import { Observable, map, switchMap, from, of, EMPTY } from 'rxjs';

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
  ) {
    this.authService.error$.subscribe((error) => {
      if (error) {
        this.error = error;
        this.isLoading = false;
      }
    });
  }

  async onVehicleSelected(vehicle: Vehicle) {
    this.selectedVehicle = vehicle.vehicleImage;
    this.showGlobalSettings = true;
  }

  private getVehicleType(): Observable<VehicleType> {
    return this.vehicleService.getVehicleTypes().pipe(
      map((types) => {
        const type = types.find((t) => t.code === this.selectedVehicle?.vehicle_type_code);
        if (!type) {
          this.error = 'No matching vehicle type found';
          return {} as VehicleType;
        }
        return type;
      }),
    );
  }

  private insertSettings(): Observable<{ globalSettingsId: string; specificSettingsId: string }> {
    return this.vehicleConfigurationService.insertGlobalSettings(this.globalSettings).pipe(
      switchMap((globalResult) => {
        const globalSettingsId = globalResult.data?.insert_vehicle_global_settings_one?.id;
        if (!globalSettingsId) {
          this.error = 'Failed to create global settings';
          return EMPTY;
        }
        return this.vehicleConfigurationService.insertSpecificSettings(this.specificSettings).pipe(
          map((specificResult) => {
            const specificSettingsId =
              specificResult.data?.insert_vehicle_specific_settings_one?.id;
            if (!specificSettingsId) {
              this.error = 'Failed to create specific settings';
              return {} as { globalSettingsId: string; specificSettingsId: string };
            }
            return { globalSettingsId, specificSettingsId };
          }),
        );
      }),
    );
  }

  private insertConfiguration(
    cognitoSubId: string,
    vehicleType: VehicleType,
    settingsIds: { globalSettingsId: string; specificSettingsId: string },
  ): Observable<any> {
    return this.vehicleConfigurationService.insertVehicleConfiguration({
      vehicle_images_names_id: this.selectedVehicle!.id,
      vehicle_types_id: vehicleType.id,
      cognito_sub_id: cognitoSubId,
      global_settings_id: settingsIds.globalSettingsId,
      specific_settings_id: settingsIds.specificSettingsId,
    });
  }

  onSaveSettings(): void {
    this.specificSettingsComponent.isLoading = true;

    from(this.authService.getCurrentSession())
      .pipe(
        switchMap((result) => {
          return this.getVehicleType().pipe(map((type) => ({ session: result, type })));
        }),
        switchMap(({ session, type }) =>
          this.insertSettings().pipe(map((settingsIds) => ({ session, type, settingsIds }))),
        ),
        switchMap(({ session, type, settingsIds }) =>
          this.insertConfiguration(session!.userSub!, type, settingsIds),
        ),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
        error: () => {
          this.error = 'Could not save configuration, sorry for the inconvenience';
          this.specificSettingsComponent.isLoading = false;
        },
        complete: () => {
          this.specificSettingsComponent.isLoading = false;
        },
      });
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
