import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VehicleCategory, VehicleType } from '../../models/vehicle.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-filters.component.html',
  styleUrl: './vehicle-filters.component.css',
})
export class VehicleFiltersComponent implements OnInit {
  @Input() configuredFilter = true;
  categories: VehicleCategory[] = [];
  vehicleTypes: VehicleType[] = [];
  showNotConfigured = false;

  @Output() filterChange = new EventEmitter<{
    category: number | null;
    type: string;
    showNotConfigured: boolean;
  }>();

  selectedCategory: number | null = null;
  selectedType: string = '';

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTypes();
  }

  private loadCategories(): void {
    this.vehicleService.getVehicleCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
    });
  }

  private loadTypes(): void {
    this.vehicleService.getVehicleTypes().subscribe({
      next: (types) => {
        this.vehicleTypes = types;
      },
    });
  }

  onCategoryChange(category: number | null) {
    this.filterChange.emit({
      category,
      type: this.selectedType,
      showNotConfigured: this.showNotConfigured,
    });
  }

  onTypeChange(type: string) {
    this.filterChange.emit({
      category: this.selectedCategory,
      type,
      showNotConfigured: this.showNotConfigured,
    });
  }

  onConfiguredChange(showNotConfigured: boolean) {
    this.showNotConfigured = showNotConfigured;
    this.filterChange.emit({
      category: this.selectedCategory,
      type: this.selectedType,
      showNotConfigured,
    });
  }
}
