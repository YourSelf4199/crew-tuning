import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { selectAuthStateFull } from '../../store/auth/auth.selectors';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  private readonly hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

  constructor(
    private store: Store,
    private http: HttpClient,
  ) {}

  deleteVehicleConfiguration(
    vehicleId: number,
    globalSettingsId: string,
    specificSettingsId: string,
  ): Observable<any> {
    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    console.log(vehicleId);
    console.log(globalSettingsId);
    console.log(specificSettingsId);

    const DELETE_VEHICLE_QUERY = `
      mutation DeleteAllRelatedVehicleData(
      $globalSettingsId: uuid!,
      $specificSettingsId: uuid!,
      $vehicleId: Int!
    ) {
      delete_vehicle_global_settings_by_pk(id: $globalSettingsId) {
        id
      }
      delete_vehicle_specific_settings_by_pk(id: $specificSettingsId) {
        id
      }
      delete_vehicle_configuration(where: { vehicle_images_names_id: { _eq: $vehicleId } }) {
        affected_rows
      }
    }
    `;

    const variables = {
      globalSettingsId,
      specificSettingsId,
      vehicleId,
    };

    return this.http
      .post<any>(
        this.hasuraUrl,
        {
          query: DELETE_VEHICLE_QUERY,
          variables,
        },
        { headers },
      )
      .pipe(
        tap((response) => {
          console.log('Full delete response:', response);
        }),
      );
  }
}
