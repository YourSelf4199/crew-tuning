import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleConfiguration } from '../../../models/vehicle-configuration.model';

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

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholder.jpg';
  }
}
