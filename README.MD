# Poblazioaren Txostena - Ionic Proiektua

## Deskribapena
Proiektu honek OpenWeatherMap API erabiltzen du hainbat hiriren koordenatu geografikoak eskuratzeko, eta Chart.js bidez grafikoki irudikatzeko. Gainera, jsPDF eta html2canvas erabiliz, lortutako datuekin PDF txosten bat sortzen du.

## Instalazioa

### 1. Node.js eta Ionic instalatzea
Proiektua abiarazi aurretik, beharrezkoa da Node.js eta Ionic instalatuta izatea. Instalatzeko:

```sh
npm install -g @ionic/cli
```

### 2. Proiektua klonatu eta menpekotasunak instalatu

```sh
git clone https://github.com/erabiltzailea/proiektua.git
cd proiektua
npm install
```

### 3. Beharrezko paketeak instalatu

```sh
npm install chart.js
npm install jspdf html2canvas
```

## Erabilitako Teknologiak
- **Ionic**: Web aplikazio mugikorra garatzeko
- **Angular**: Egituratutako aplikazioa sortzeko
- **Chart.js**: Datuak grafikoki irudikatzeko
- **jsPDF eta html2canvas**: PDF txostena sortzeko
- **OpenWeatherMap API**: Hiri bakoitzaren koordenatuak eskuratzeko

## Kodearen azalpena

### 1. **Zerbitzua: `poblacion.service.ts`**
Fitxategi hau OpenWeatherMap APIrekin konektatzen da hiri baten edo hainbat hiriren koordenatuak lortzeko:

```typescript
@Injectable({
  providedIn: 'root'
})
export class PoblacionService {
  private apiKey = 'API_GAKOA';
  private geoUrl = 'https://api.openweathermap.org/geo/1.0/direct';

  constructor(private http: HttpClient) {}

  getCityCoordinates(city: string): Observable<any> {
    return this.http.get(`${this.geoUrl}?q=${city}&limit=1&appid=${this.apiKey}`);
  }

  getMultipleCitiesCoordinates(cities: string[]): Observable<any[]> {
    const requests = cities.map(city => this.getCityCoordinates(city));
    return forkJoin(requests);
  }
}
```

### 2. **Home konponentea: `home.ts`**
Hirien koordenatuak hartu eta grafikoki irudikatzen ditu, eta PDF bat sortzeko aukera ematen du.

```typescript
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements AfterViewInit {
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;

  constructor(private poblacionService: PoblacionService) {}

  ngAfterViewInit() {
    this.loadCharts();
  }

  loadCharts() {
    const cities = ['Bilbao', 'Madrid', 'Barcelona'];
    this.poblacionService.getMultipleCitiesCoordinates(cities).subscribe((data: any[]) => {
      const latitudes = data.map(city => city[0]?.lat);
      const labels = data.map(city => city[0]?.name);

      new Chart(this.barChartCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Latitud',
            data: latitudes,
            backgroundColor: ['#ff5733', '#ffbd33', '#33ff57']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    });
  }

  generarPDF() {
    const doc = new jsPDF();
    doc.text('Koordenatu Geografikoen Txostena', 80, 20);
    doc.save('txostena.pdf');
  }
}
```

### 3. **Home orrialdea: `home.html`**

```html
<ion-header>
  <ion-toolbar>
    <ion-title>Koordenatuen Txostena</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="content-container">
    <div class="chart-container">
      <canvas #barChartCanvas></canvas>
    </div>
    <ion-button expand="full" (click)="generarPDF()">Sortu PDF Txostena</ion-button>
  </div>
</ion-content>
```

## Proiektua abiaraztea

```sh
ionic serve
```

## Ondorioa
Aplikazio honek OpenWeatherMap API bidez hiri baten edo hirien koordenatuak eskuratzen ditu, Chart.js erabiliz grafikoki bistaratzen ditu, eta jsPDF erabiliz PDF txosten bat sortzen du.
