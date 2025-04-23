import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleConfigurationService } from '../../services/vehicle-configuration.service';
import { AuthService } from '../../services/auth.service';
import { CarActionsPopupComponent } from '../../components/dashboard/car-actions-popup/car-actions-popup.component';
import { VehicleConfiguration } from '../../models/vehicle-configuration.model';
import { Router } from '@angular/router';
import { getVehicleCategoryColor } from '../../utils/vehicle.utils';
import { handleS3ImageError } from '../../utils/s3.utils';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { VehicleFiltersComponent } from '../../components/vehicle-filters/vehicle-filters.component';
import { from, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CarActionsPopupComponent,
    LoadingSpinnerComponent,
    VehicleFiltersComponent,
  ],
})
export class DashboardComponent implements OnInit {
  configurations: VehicleConfiguration[] = [];
  selectedCategory: number | null = null;
  selectedType: string = '';
  isLoading = true;
  error: string | null = null;
  imageLoadingStates: { [key: string]: boolean } = {};
  private failedImages = new Set<string>();
  selectedConfig: VehicleConfiguration | null = null;

  constructor(
    private vehicleConfigurationService: VehicleConfigurationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.error$.subscribe((error) => {
      if (error) {
        this.error = error;
        this.isLoading = false;
      }
    });
    from(this.authService.getCurrentSession())
      .pipe(
        switchMap((session) =>
          this.vehicleConfigurationService.getVehicleConfigurations(session!.userSub!),
        ),
      )
      .subscribe({
        next: (configs) => {
          this.configurations = configs;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load vehicle configurations';
          this.isLoading = false;
        },
      });
  }

  handleImageError(event: Event, config: VehicleConfiguration): void {
    handleS3ImageError(
      event,
      config.vehicle_images_name.id,
      config.vehicle_images_name.name,
      this.failedImages,
    );
  }

  onConfigSelected(config: VehicleConfiguration) {
    this.selectedConfig = config;
  }

  onViewSettingsConfig(config: VehicleConfiguration) {
    this.router.navigate([
      '/app/view-car-tuning',
      config.vehicle_images_names_id,
      config.vehicle_images_name.name,
    ]);
  }

  onDeleteConfig(config: VehicleConfiguration) {
    if (!config.vehicle_images_names_id) {
      this.error = 'No vehicle found, sorry for the inconvenience';
      return;
    }

    const id = parseInt(config.vehicle_images_names_id, 10);

    this.isLoading = true;
    this.vehicleConfigurationService.deleteVehicleConfiguration(id).subscribe({
      next: () => {
        this.onClosePopup();
      },
      error: (error) => {
        this.error = 'Error deleting configuration';
        this.isLoading = false;
      },
    });
  }

  onClosePopup() {
    this.selectedConfig = null;
  }

  getColorForCategory(label: string): string {
    return getVehicleCategoryColor(label);
  }

  onFilterChange(filters: { category: number | null; type: string }) {
    this.selectedCategory = filters.category;
    this.selectedType = filters.type;
  }

  onImageLoad(vehicleId: string) {
    this.imageLoadingStates[vehicleId] = true;
  }
}
