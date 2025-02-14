import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart, registerables } from 'chart.js';
import { PoblacionService } from '../services/poblacion.service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements AfterViewInit {
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;
  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas', { static: false }) pieChartCanvas!: ElementRef;

  constructor(private poblacionService: PoblacionService) {}

  ngAfterViewInit() {
    this.loadCharts();
  }

  /**
   * Carga gráficos con datos de latitud y longitud de distintas ciudades.
   */
  loadCharts() {
    const cities = ['Bilbao', 'Madrid', 'Barcelona'];

    this.poblacionService.getMultipleCitiesCoordinates(cities).subscribe((data: any[]) => {
      // Tomamos latitudes y longitudes de los datos obtenidos
      const latitudes = data.map(city => city[0]?.lat); // Usamos [0] porque la API devuelve un array de resultados
      const longitudes = data.map(city => city[0]?.lon);

      const labels = data.map(city => city[0]?.name); // Extraemos los nombres de las ciudades

      // Gráfico de barras para latitud
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

      // Gráfico de líneas para longitud
      new Chart(this.lineChartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Longitud',
            data: longitudes,
            borderColor: '#3399ff',
            fill: true,
            backgroundColor: 'rgba(51, 153, 255, 0.2)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      // Gráfico de torta de latitudes vs longitudes
      new Chart(this.pieChartCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Latitud y Longitud combinadas',
            data: latitudes.map((lat, i) => lat + longitudes[i]), // Combinación para fines demostrativos
            backgroundColor: ['#ff3333', '#33ff33', '#3333ff']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    });
  }

  /**
   * Genera un informe en PDF con los gráficos y datos de latitud y longitud.
   */
  generarPDF() {
    const doc = new jsPDF();

    // Agregar logo
    const img = new Image();
    img.src = 'assets/logo.png'; // Asegúrate de tener esta imagen en /assets
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      doc.setFontSize(18);
      doc.text('Informe de Coordenadas Geográficas', 80, 20);

      doc.setFontSize(12);
      doc.text('Comparativa de latitud, longitud y combinación', 20, 50);

      // Capturar y agregar gráficos al PDF
      const charts = [
        { canvas: this.barChartCanvas.nativeElement, y: 60, title: 'Latitud' },
        { canvas: this.lineChartCanvas.nativeElement, y: 120, title: 'Longitud' },
        { canvas: this.pieChartCanvas.nativeElement, y: 180, title: 'Latitud vs Longitud' }
      ];

      let captures = 0;

      // Esperar a que todos los gráficos se capturen
      const totalCharts = charts.length;

      charts.forEach(({ canvas, y, title }) => {
        // Verificar si el canvas existe antes de capturarlo
        if (canvas) {
          html2canvas(canvas).then(canvasImage => {
            const imgData = canvasImage.toDataURL('image/png');
            doc.text(title, 20, y - 10);
            doc.addImage(imgData, 'PNG', 20, y, 170, 50);

            captures++;

            // Si todos los gráficos se han capturado, generar el PDF
            if (captures === totalCharts) {
              doc.save('informe_coordenadas.pdf');
            }
          }).catch(error => {
            console.error('Error al capturar el gráfico:', error);
          });
        } else {
          console.error('Canvas no encontrado para el gráfico:', title);
        }
      });
    };
  }

}
