import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';
import { getVehicleCategoryColor } from '../../../utils/vehicle.utils';
import { handleS3ImageError } from '../../../utils/s3.utils';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-select-vehicle',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './select-vehicle.component.html',
  styleUrls: ['./select-vehicle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectVehicleComponent {
  @Output() vehicleSelected = new EventEmitter<Vehicle>();

  vehicleImages: Vehicle[] = [];
  isLoading = true;
  error: string | null = null;
  private failedImages = new Set<string>();

  constructor(
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadVehicleImages();
  }

  private loadVehicleImages(): void {
    this.vehicleService.getVehicleImages().subscribe({
      next: (images) => {
        this.vehicleImages = images;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load vehicle images';
        this.isLoading = false;
        this.cdr.markForCheck();
        console.error('Error loading vehicle images:', err);
      },
    });
  }

  onVehicleSelected(vehicle: Vehicle): void {
    this.vehicleSelected.emit(vehicle);
  }

  handleImageError(event: Event, vehicle: Vehicle): void {
    handleS3ImageError(
      event,
      vehicle.vehicleImage.id,
      vehicle.vehicleImage.name,
      this.failedImages,
    );
  }

  getColorForCategory(label: string): string {
    return getVehicleCategoryColor(label);
  }
}
