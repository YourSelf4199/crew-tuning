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
  private failedImages = new Set<string>();
  selectedConfig: VehicleConfiguration | null = null;

  constructor(
    private vehicleConfigurationService: VehicleConfigurationService,
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const session = await this.authService.getCurrentSession();
      const cognitoSubId = session.userSub;

      if (!cognitoSubId) {
        this.error = 'No user session found';
        this.isLoading = false;
        return;
      }

      this.vehicleConfigurationService.getVehicleConfigurations(cognitoSubId).subscribe({
        next: (configs) => {
          this.configurations = configs;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load vehicle configurations';
          this.isLoading = false;
          console.error('Error loading vehicle configurations:', err);
        },
      });
    } catch (error) {
      this.error = 'Failed to get user session';
      this.isLoading = false;
      console.error('Error getting user session:', error);
    }
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
    this.router.navigate(['/app/view-car-tuning', config.vehicle_images_names_id]);
  }

  onDeleteConfig(config: VehicleConfiguration) {
    if (!config.vehicle_images_names_id) {
      console.error('No vehicle_images_names_id found in config');
      return;
    }

    const id = parseInt(config.vehicle_images_names_id, 10);

    this.isLoading = true;
    this.vehicleConfigurationService.deleteVehicleConfiguration(id).subscribe({
      next: () => {
        console.log('Configuration deleted successfully');
        this.onClosePopup();
      },
      error: (error) => {
        console.error('Error deleting configuration:', error);
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
}
