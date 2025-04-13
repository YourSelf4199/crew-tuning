import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { getUrl } from 'aws-amplify/storage';
import { VehicleWithSignedUrl } from '../../../models/VehicleWithSignedUrl';
import { Store } from '@ngrx/store';
import { selectAllVehicles } from '../../../store/vehicles/vehicles.selectors';
import {
  resetSelectedVehicle,
  setSelectedVehicleId,
} from '../../../store/vehicles/vehicles.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-car',
  imports: [NgFor, CommonModule],
  templateUrl: './select-car.component.html',
  styleUrl: './select-car.component.css',
})
export class SelectCarComponent implements OnInit {
  vehicles: VehicleWithSignedUrl[] = [];

  constructor(
    private store: Store,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.vehicles = this.store.selectSignal(selectAllVehicles)();
  }

  onSelect(id: number, type: string) {
    this.store.dispatch(setSelectedVehicleId({ selectedVehicleId: id, selectedVehicleType: type }));
  }

  // Check for yellow codes
  isYellowCode(code: string) {
    return code === 'SR' || code === 'HC' || code === 'DF' || code === 'DG';
  }

  // Check for blue codes
  isBlueCode(code: string): boolean {
    return code === 'TC' || code === 'PB' || code === 'A' || code === 'AR';
  }

  cancelAction() {
    this.store.dispatch(resetSelectedVehicle());
    this.router.navigate(['/dashboard']);
  }
}
