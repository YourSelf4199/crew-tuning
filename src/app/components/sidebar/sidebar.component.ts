import { Component, computed, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthStateFull } from '../../store/auth/auth.selectors';
import {
  loadVehicles,
  loadTypesAndCategories,
  getUserVehicleConfigurations,
} from '../../store/vehicles/vehicles.actions';
import {
  selectAllVehicles,
  selectAllTypesAndCategories,
  selectUserConfigurations,
} from '../../store/vehicles/vehicles.selectors';
import { take } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  isMenuOpen = true;

  constructor(
    private authService: AuthService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(selectAllVehicles).subscribe((vehicles) => {
      if (vehicles.length === 0) {
        this.store.dispatch(loadVehicles());
      }
    });
    this.store.select(selectAllTypesAndCategories).subscribe((types) => {
      if (types.length === 0) {
        this.store.dispatch(loadTypesAndCategories());
      }
    });

    const authState = this.store.selectSignal(selectAuthStateFull);
    this.store.select(selectUserConfigurations).subscribe((configurations) => {
      if (configurations.length === 0) {
        this.store.dispatch(getUserVehicleConfigurations({ userId: authState().userId }));
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleSignOut() {
    this.authService.signOut();
  }
}
