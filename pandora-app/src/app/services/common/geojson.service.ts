import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GeoJSONService {

  constructor(
    private http: HttpClient
  ) {}

  getGeoJSON(uf: string) {
    return this.http.get(`assets/geojson/${uf}.json`);
  }
}
