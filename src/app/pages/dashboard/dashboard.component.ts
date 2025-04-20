import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleConfigurationService } from '../../services/vehicle-configuration.service';
import { AuthService } from '../../services/auth.service';
import { CarActionsPopupComponent } from '../../components/dashboard/car-actions-popup/car-actions-popup.component';
import { VehicleConfiguration } from '../../models/vehicle-configuration.model';
import { Router } from '@angular/router';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, CarActionsPopupComponent],
})
export class DashboardComponent implements OnInit {
  configurations: VehicleConfiguration[] = [];
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
    if (this.failedImages.has(config.vehicle_images_name.id)) return;

    const imgElement = event.target as HTMLImageElement;
    this.failedImages.add(config.vehicle_images_name.id);
    imgElement.src = 'assets/images/placeholder.jpg';
    console.error(`Failed to load image: ${config.vehicle_images_name.name}`);
  }

  onConfigSelected(config: VehicleConfiguration) {
    this.selectedConfig = config;
  }

  onViewSettingsConfig(config: VehicleConfiguration) {
    this.router.navigate(['/app/view-car-tuning', config.vehicle_images_names_id]);
  }

  onDeleteConfig(config: VehicleConfiguration) {
    // Will be implemented later
    this.selectedConfig = null;
  }

  onClosePopup() {
    this.selectedConfig = null;
  }
}
