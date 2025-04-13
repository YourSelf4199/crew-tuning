import { inject, Injectable } from '@angular/core';
import {
  getUserVehicleConfigurations,
  getUserVehicleConfigurationsSuccess,
  loadTypesAndCategories,
  loadTypesAndCategoriesSuccess,
  loadVehicles,
  loadVehiclesSuccess,
  resetSelectedVehicle,
  submitSelectedVehicle,
  submitSelectedVehicleSuccess,
  updateVehicleConfiguration,
  updateVehicleConfigurationSuccess,
} from './vehicles.actions';
import {
  catchError,
  EMPTY,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs';
import { getUrl } from 'aws-amplify/storage';
import { InsertService } from '../../services/database-queries.ts/insert.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  selectAllTypesAndCategories,
  selectAllVehicles,
  selectSelectedVehicleState,
} from './vehicles.selectors';
import { Store } from '@ngrx/store';
import { FetchService } from '../../services/database-queries.ts/fetch.service';
import { selectAuthStateFull } from '../auth/auth.selectors';
import { GlobalSettings } from '../../models/VehicleGlobalSettings/GlobalSettings';
import { SpecificSettings } from '../../models/VehicleSpecificSettings/SpecificSettings';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class VehicleEffects {
  private actions$ = inject(Actions);
  private insertQueriesService = inject(InsertService);
  private fetchQueriesService = inject(FetchService);
  private store = inject(Store);

  loadVehicles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVehicles),
      switchMap(() =>
        this.fetchQueriesService.getAllVehicleImagesAndNames().pipe(
          switchMap((vehicles) =>
            from(vehicles).pipe(
              mergeMap(
                (vehicle) =>
                  from(
                    getUrl({ path: vehicle.s3_image_url })
                      .then((signed) => ({
                        ...vehicle,
                        signedUrl: signed.url.toString(),
                      }))
                      .catch((err) => {
                        console.error(`Failed to get signed URL for ${vehicle.name}`, err);
                        return { ...vehicle, signedUrl: '' };
                      }),
                  ),
                5, // ⏳ limit to 5 concurrent signed URL requests
              ),
              toArray(),
              map((vehiclesWithUrls) => loadVehiclesSuccess({ vehicles: vehiclesWithUrls })),
            ),
          ),
          catchError((error) => {
            console.error('Vehicle loading failed:', error);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  loadTypesAndCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTypesAndCategories), // Listen for the loadTypesAndCategories action
      switchMap(() =>
        this.store.select(selectAllTypesAndCategories).pipe(
          // Check if types & categories are already loaded
          switchMap((existingTypesAndCategories) => {
            if (existingTypesAndCategories.length > 0) {
              return of(
                loadTypesAndCategoriesSuccess({ typesAndCategories: existingTypesAndCategories }),
              );
            }

            // Fetch data if it's not already in the store
            return this.fetchQueriesService.getAllVehicleTypesAndCategories().pipe(
              map(
                (vehicleTypes) =>
                  loadTypesAndCategoriesSuccess({ typesAndCategories: vehicleTypes }), // Dispatch success action with data
              ),
              catchError((error) => {
                console.error('Vehicle types and categories loading failed:', error);
                return EMPTY;
              }),
            );
          }),
        ),
      ),
    ),
  );

  submitSelectedVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(submitSelectedVehicle),
      withLatestFrom(
        this.store.select(selectSelectedVehicleState),
        this.store.select(selectAuthStateFull),
      ),
      switchMap(([_, selectedVehicle, authState]) =>
        this.insertQueriesService.submitFullVehicleConfiguration(selectedVehicle).pipe(
          tap((response) => {
            this.store.dispatch(resetSelectedVehicle());
            this.store.dispatch(getUserVehicleConfigurations({ userId: authState.userId }));
          }),
          map(() => submitSelectedVehicleSuccess()),
          catchError((error) => {
            console.error('❌ Vehicle submission failed:', error);
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  getUserVehicleConfigurations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVehiclesSuccess, submitSelectedVehicleSuccess, updateVehicleConfigurationSuccess),
      withLatestFrom(this.store.select(selectAuthStateFull), this.store.select(selectAllVehicles)),
      switchMap(([action, authState, vehiclesWithUrls]) => {
        return this.fetchQueriesService.getUserVehicleConfigurations().pipe(
          map((configurations) => {
            const mappedConfigurations = configurations.map((config: any) => {
              // Find the corresponding vehicle from vehiclesWithUrls
              const matchingVehicle = vehiclesWithUrls.find(
                (vehicle: any) => vehicle.id === config.vehicle_images_name.id,
              );

              // Use the signedUrl from the found vehicle
              const signedUrl = matchingVehicle ? matchingVehicle.signedUrl : '';

              return {
                imageAndName: {
                  id: config.vehicle_images_name.id,
                  signedUrl,
                  name: config.vehicle_images_name.name,
                },
                vehicleTypeAndCategory: {
                  id: config.vehicle_type.id,
                  code: config.vehicle_type.code,
                },
                globalSettings: config.vehicle_global_setting,
                specificSettings: config.vehicle_specific_setting,
              };
            });

            // Dispatch success action with mapped configurations
            return getUserVehicleConfigurationsSuccess({
              vehicleConfigurations: mappedConfigurations,
            });
          }),
          catchError((error) => {
            console.error(error);
            return EMPTY;
          }),
        );
      }),
    ),
  );

  updateVehicleConfiguration$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateVehicleConfiguration),
      withLatestFrom(this.store.select(selectAuthStateFull)),
      switchMap(([action, authState]) => {
        const { selectedVehicleId, globalSettings, specificSettings } = action;
        return this.fetchQueriesService.fetchSettingsIds(selectedVehicleId).pipe(
          switchMap(({ globalSettingsId, specificSettingsId }) => {
            if (globalSettingsId && specificSettingsId) {
              // Call the method that handles the mutation
              return this.insertQueriesService
                .updateVehicleSettings(
                  globalSettingsId,
                  specificSettingsId,
                  globalSettings,
                  specificSettings,
                )
                .pipe(
                  tap(() => {
                    this.store.dispatch(resetSelectedVehicle());
                    this.store.dispatch(getUserVehicleConfigurations({ userId: authState.userId }));
                  }),
                  map(() => updateVehicleConfigurationSuccess()), // Dispatch success action
                  catchError((error) => {
                    console.error('Error updating vehicle settings:', error);
                    return EMPTY; // Optionally dispatch a failure action
                  }),
                );
            } else {
              throw new Error('Failed to fetch global/specific settings IDs');
            }
          }),
          catchError((error) => {
            console.error('Error fetching settings IDs:', error);
            return EMPTY; // Optionally dispatch a failure action
          }),
        );
      }),
    ),
  );
}
