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
import { FormsModule } from '@angular/forms';
import { VehicleFiltersComponent } from '../../vehicle-filters/vehicle-filters.component';
import { AuthService } from '../../../services/auth.service';
import { VehicleConfigurationService } from '../../../services/vehicle-configuration.service';
import { from, switchMap, forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-select-vehicle',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule, VehicleFiltersComponent],
  templateUrl: './select-vehicle.component.html',
  styleUrls: ['./select-vehicle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectVehicleComponent {
  @Output() vehicleSelected = new EventEmitter<Vehicle>();

  vehicleImages: Vehicle[] = [];
  selectedCategory: number | null = null;
  selectedType: string = '';
  showNotConfigured = false;
  isLoading = true;
  error: string | null = null;
  imageLoadingStates: { [key: string]: boolean } = {};
  private failedImages = new Set<string>();

  constructor(
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private vehicleConfigurationService: VehicleConfigurationService,
  ) {}

  ngOnInit(): void {
    this.loadVehicleImages();
  }

  private loadVehicleImages(): void {
    from(this.authService.getCurrentSession())
      .pipe(
        switchMap((session) => {
          if (!session.userSub) {
            throw new Error('No user session');
          }
          return this.vehicleService.getVehicleImages().pipe(
            switchMap((images) =>
              forkJoin(
                images.map((vehicle) =>
                  this.vehicleConfigurationService
                    .checkVehicleConfigured(parseInt(vehicle.vehicleImage.id), session.userSub!)
                    .pipe(
                      map((isConfigured) => {
                        // Initialize loading state for this vehicle
                        this.imageLoadingStates[vehicle.vehicleImage.id] = false;
                        return {
                          ...vehicle,
                          isConfigured,
                        };
                      }),
                    ),
                ),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (vehicles) => {
          this.vehicleImages = vehicles;
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
    if (!vehicle.isConfigured) {
      this.vehicleSelected.emit(vehicle);
    }
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

  onFilterChange(filters: { category: number | null; type: string; showNotConfigured: boolean }) {
    this.selectedCategory = filters.category;
    this.selectedType = filters.type;
    this.showNotConfigured = filters.showNotConfigured;
  }

  onImageLoad(vehicleId: string) {
    this.imageLoadingStates[vehicleId] = true;
    this.cdr.markForCheck();
  }
}
