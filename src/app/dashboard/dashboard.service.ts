import { Injectable } from '@angular/core';

import { PermissionsService } from '@ng-web-apis/permissions';

import { Observable, of, Subject } from 'rxjs';

import { OpenWeatherApiService } from '../core/api/openweather-api.service';
import { UnitsMeasurement } from '../shared/enums/units-measurement.enum';
import {
  OpenWeatherApiResponse,
  AirPollutionApiResponse,
  ReverseGeocoderApiResponse
} from '../core/api/openweather-api.model';
import { GeolocationApiService } from '../core/services/geolocation-api.service';
import { GeolocationPosition, GeolocationPositionError } from '../shared/models/geolocation-position.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private geolocationPermissionStatus: string;

  private geolocationStatusSubject = new Subject<string>();
  geolocationStatusChanged$: Observable<string>;

  private geolocationPositionSubject = new Subject<void>();
  geolocationPositionChanged$: Observable<void>;

  constructor(
    private openWeatherApiService: OpenWeatherApiService,
    private geolocationApiService: GeolocationApiService,
    private readonly permissions: PermissionsService
  ) {
    this.geolocationStatusChanged$ = this.geolocationStatusSubject.asObservable();
    this.geolocationPositionChanged$ = this.geolocationPositionSubject.asObservable();

    this.permissions.state('geolocation').subscribe(geolocationStatus => {
      this.geolocationPermissionStatus = geolocationStatus;
      this.geolocationStatusSubject.next(geolocationStatus);
    });
  }

  getCurrentWeather(unit?: UnitsMeasurement): Observable<OpenWeatherApiResponse> {
    const geoLocationPosition = this.getGeolocationPosition();
    if (geoLocationPosition) {
      return this.openWeatherApiService.getCurrentAndForecastWeather(
        geoLocationPosition.coords.latitude,
        geoLocationPosition.coords.longitude,
        unit
      );

      // return this.openWeatherApiService.getStaticCurrentAndForecastWeather(unit);
    }

    return of(undefined);
  }

  getAirPollution(): Observable<AirPollutionApiResponse> {
    const geoLocationPosition = this.getGeolocationPosition();
    if (geoLocationPosition) {
      return this.openWeatherApiService.getAirPollutionInfo(
        geoLocationPosition.coords.latitude,
        geoLocationPosition.coords.longitude,
      );

      // return this.openWeatherApiService.getStaticAirPollutionInfo();
    }

    return of(undefined);
  }

  getLocationNameWithOpenWeatherApi(): Observable<ReverseGeocoderApiResponse[]> {
    const geoLocationPosition = this.getGeolocationPosition();
    if (geoLocationPosition) {
      return this.openWeatherApiService.getLocationNameByCoords(
        geoLocationPosition.coords.latitude,
        geoLocationPosition.coords.longitude,
      );
    }

    return of(undefined);
  }

  getGeoLocationName(): string {
    return this.geolocationApiService.getGeoLocationName();
  }
  setGeoLocationName(locationName: string): void {
    this.geolocationApiService.setGeoLocationName(locationName);
  }

  getGeolocationPositionError(): GeolocationPositionError {
    return this.geolocationApiService.getGeolocationPositionError();
  }

  async setGeolocationPosition(): Promise<boolean> {
    return await this.geolocationApiService.setLocation();
  }

  updateGeolocationPosition(lat: number, lng: number): void {
    this.geolocationApiService.setGeolocationPosition(lat, lng);
    this.geolocationPositionSubject.next();
  }

  getGeolocationStatus(): string {
    return this.geolocationPermissionStatus;
  }

  private getGeolocationPosition(): GeolocationPosition {
    return this.geolocationApiService.getGeolocationPosition();
  }

}
