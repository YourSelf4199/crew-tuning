import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { getUrl } from 'aws-amplify/storage';
import { VehicleWithSignedUrl } from '../../../models/VehicleWithSignedUrl';
import { Store } from '@ngrx/store';
import { selectAllVehicles } from '../../../store/vehicles/vehicles.selectors';
import { setSelectedVehicleId } from '../../../store/vehicles/vehicles.actions';

@Component({
  selector: 'app-select-car',
  imports: [NgFor],
  templateUrl: './select-car.component.html',
  styleUrl: './select-car.component.css',
})
export class SelectCarComponent implements OnInit {
  vehicles: VehicleWithSignedUrl[] = [];

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.vehicles = this.store.selectSignal(selectAllVehicles)();
  }

  onSelect(id: number, type: string) {
    this.store.dispatch(setSelectedVehicleId({ selectedVehicleId: id, selectedVehicleType: type }));
  }
}
