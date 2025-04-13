import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehicleState } from './vehicles.reducer';

export const selectVehicleState = createFeatureSelector<VehicleState>('vehicle');

export const selectAllVehicles = createSelector(selectVehicleState, (state) => state.vehicles);

export const selectAllTypesAndCategories = createSelector(
  selectVehicleState,
  (state) => state.typesAndCategories,
);

export const selectUserConfigurations = createSelector(
  selectVehicleState,
  (state) => state.vehicleConfigurations,
);

export const selectSelectedVehicleState = createSelector(
  selectVehicleState,
  (state) => state.selectedVehicle,
);

export const selectSelectedVehicleIdAndType = createSelector(
  selectSelectedVehicleState,
  (selectedVehicle) => ({
    selectedVehicleId: selectedVehicle.selectedVehicleId,
    selectedVehicleType: selectedVehicle.selectedVehicleType,
  }),
);

export const selectHasSelectedVehicle = createSelector(
  selectSelectedVehicleState,
  (selectedVehicle) => !!selectedVehicle?.selectedVehicleId,
);

export const selectHasGlobalSettings = createSelector(
  selectSelectedVehicleState,
  (selectedVehicle) => !!selectedVehicle?.globalSettings,
);

export const selectIsUpdatingConfiguration = createSelector(
  selectSelectedVehicleState,
  (selectedVehicle) =>
    !!selectedVehicle?.selectedVehicleId &&
    !!selectedVehicle?.globalSettings &&
    !!selectedVehicle?.specificSettings,
);

export const selectCurrentStep = createSelector(
  selectSelectedVehicleState,
  (selectedVehicle) => selectedVehicle?.step ?? 'global',
);
