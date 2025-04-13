import { Component, computed } from '@angular/core';
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
} from '../../store/vehicles/vehicles.selectors';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  isMenuOpen = true;

  constructor(
    private authService: AuthService,
    private store: Store,
  ) {
    this.store.select(selectAllVehicles).subscribe((vehicles) => {
      if (vehicles.length === 0) {
        this.store.dispatch(loadVehicles());
      }
    });
    const types = this.store.selectSignal(selectAllTypesAndCategories)();
    if (types.length === 0) {
      this.store.dispatch(loadTypesAndCategories());
    }
    const authState = this.store.selectSignal(selectAuthStateFull);
    this.store.dispatch(getUserVehicleConfigurations({ userId: authState().userId }));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleSignOut() {
    this.authService.signOut();
  }
}
