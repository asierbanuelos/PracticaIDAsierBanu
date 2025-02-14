import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoblacionService {
  private apiKey = 'a2fc01bcaea326e089b76dc7f2b4a58e';
  private geoUrl = 'https://api.openweathermap.org/geo/1.0/direct';

  constructor(private http: HttpClient) {}

  // Obtener latitud y longitud de una ciudad
  getCityCoordinates(city: string): Observable<any> {
    return this.http.get(`${this.geoUrl}?q=${city}&limit=1&appid=${this.apiKey}`);
  }

  // Obtener latitud y longitud de múltiples ciudades
  getMultipleCitiesCoordinates(cities: string[]): Observable<any[]> {
    const requests = cities.map(city => this.getCityCoordinates(city));
    return forkJoin(requests); // Ejecuta todas las peticiones en paralelo y devuelve un array de resultados
  }
}
