import { createReducer, on } from '@ngrx/store';
import {
  getUserVehicleConfigurationsSuccess,
  goToSpecificSettings,
  loadTypesAndCategories,
  loadTypesAndCategoriesSuccess,
  loadVehicles,
  loadVehiclesSuccess,
  resetSelectedVehicle,
  selectUserVehicleConfiguration,
  setGlobalSettings,
  setSelectedVehicleId,
  setSpecificSettings,
  updateSelectedVehicle,
} from './vehicles.actions';
import { VehicleWithSignedUrl } from '../../models/VehicleWithSignedUrl';
import { SelectedVehicle } from '../../models/SelectedVehicle';
import { VehicleTypeWithCategory } from '../../models/VehicleTypeWithCategory';
import { VehicleConfigurations } from '../../models/VehicleConfigurations';

export interface VehicleState {
  vehicles: VehicleWithSignedUrl[];
  typesAndCategories: VehicleTypeWithCategory[];
  selectedVehicle: SelectedVehicle;
  vehicleConfigurations: VehicleConfigurations[];
}

export const initialState: VehicleState = {
  vehicles: [],
  typesAndCategories: [],
  selectedVehicle: {
    selectedVehicleId: null,
    selectedVehicleType: null,
    globalSettings: null,
    specificSettings: null,
    step: null,
  },
  vehicleConfigurations: [],
};

export const vehicleReducer = createReducer(
  initialState,
  on(loadVehicles, (state) => ({ ...state })),
  on(loadTypesAndCategories, (state) => ({ ...state })),
  on(loadVehiclesSuccess, (state, { vehicles }) => ({
    ...state,
    vehicles,
  })),
  on(loadTypesAndCategoriesSuccess, (state, { typesAndCategories }) => ({
    ...state,
    typesAndCategories,
  })),
  on(updateSelectedVehicle, (state, { updates }) => ({
    ...state,
    selectedVehicle: {
      ...state.selectedVehicle!,
      ...updates,
    },
  })),
  on(setSelectedVehicleId, (state, { selectedVehicleId, selectedVehicleType }) => ({
    ...state,
    selectedVehicle: {
      ...state.selectedVehicle,
      selectedVehicleId,
      selectedVehicleType,
    },
  })),
  on(setGlobalSettings, (state, { globalSettings }) => ({
    ...state,
    selectedVehicle: {
      ...state.selectedVehicle,
      globalSettings,
    },
  })),
  on(setSpecificSettings, (state, { specificSettings }) => ({
    ...state,
    selectedVehicle: {
      ...state.selectedVehicle,
      specificSettings,
    },
  })),
  on(resetSelectedVehicle, (state) => ({
    ...state,
    selectedVehicle: initialState.selectedVehicle,
  })),
  on(getUserVehicleConfigurationsSuccess, (state, { vehicleConfigurations }) => ({
    ...state,
    vehicleConfigurations,
  })),
  on(selectUserVehicleConfiguration, (state, { vehicleConfiguration }) => ({
    ...state,
    selectedVehicle: {
      selectedVehicleId: vehicleConfiguration.imageAndName.id,
      selectedVehicleType: vehicleConfiguration.vehicleTypeAndCategory.code,
      globalSettings: vehicleConfiguration.globalSettings,
      specificSettings: vehicleConfiguration.specificSettings,
      step: 'global',
    },
  })),
  on(goToSpecificSettings, (state) => ({
    ...state,
    selectedVehicle: {
      ...state.selectedVehicle,
      step: 'specific',
    },
  })),
);
