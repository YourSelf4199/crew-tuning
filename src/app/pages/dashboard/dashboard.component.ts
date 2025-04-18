import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleImage } from '../../models/vehicle.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
  vehicleImages: VehicleImage[] = [];
  isLoading = true;
  error: string | null = null;
  private failedImages = new Set<string>();

  constructor(private vehicleService: VehicleService) {}

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

  handleImageError(event: Event, image: VehicleImage): void {
    if (this.failedImages.has(image.id)) return; // Skip if we've already tried the placeholder

    const imgElement = event.target as HTMLImageElement;
    this.failedImages.add(image.id);
    imgElement.src = 'assets/images/placeholder.jpg';
    console.error(`Failed to load image: ${image.name}`);
  }
}
