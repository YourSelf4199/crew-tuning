import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleConfiguration } from '../../../models/vehicle-configuration.model';
import { handleS3ImageError } from '../../../utils/s3.utils';
import { getVehicleCategoryColor } from '../../../utils/vehicle.utils';

@Component({
  selector: 'app-car-actions-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-actions-popup.component.html',
})
export class CarActionsPopupComponent {
  @Input() selectedConfig!: VehicleConfiguration;
  @Output() onViewSettings = new EventEmitter<VehicleConfiguration>();
  @Output() onDelete = new EventEmitter<VehicleConfiguration>();
  @Output() onClose = new EventEmitter<void>();

  private failedImages = new Set<string>();

  getColorForCategory(label: string): string {
    return getVehicleCategoryColor(label);
  }

  handleImageError(event: Event): void {
    handleS3ImageError(
      event,
      this.selectedConfig.vehicle_images_name.id,
      this.selectedConfig.vehicle_images_name.name,
      this.failedImages,
    );
  }
}
