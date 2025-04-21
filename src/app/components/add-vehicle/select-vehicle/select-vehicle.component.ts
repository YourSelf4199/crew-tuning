import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle, VehicleImage } from '../../../models/vehicle.model';

@Component({
  selector: 'app-select-vehicle',
  standalone: true,
  imports: [CommonModule],
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
    if (this.failedImages.has(vehicle.vehicleImage.id)) return;

    const imgElement = event.target as HTMLImageElement;
    this.failedImages.add(vehicle.vehicleImage.id);
    imgElement.src = 'assets/images/placeholder.jpg';
    console.error(`Failed to load image: ${vehicle.vehicleImage.name}`);
  }

  getColorForLabel(label: string): string {
    console.log(label);

    return label === 'street-race' ? '1px #fbbf24' : '1px #3b82f6';
  }
}
