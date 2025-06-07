import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.despertarAPI();
  }

  private despertarAPI(): void {
    // Hacemos una solicitud GET simple para despertar la API
    this.http.get(this.apiUrl).subscribe({
      next: (response) => {
        console.log('API despierta:', response);
      },
      error: (err) => {
        console.warn('La API podría estar durmiendo, intentando despertarla...');
        console.error('Error al despertar la API:', err);
      }
    });
  }
}