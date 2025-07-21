import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws';

  constructor(
    private http: HttpClient,
    private platform: Platform // <-- inyectamos Platform
  ) {}

  ngOnInit(): void {
    this.platform.ready().then(() => {
      // 1. Fijamos un tamaño base predecible para rem/em
      // const scale = window.devicePixelRatio || 1;
      // document.documentElement.style.fontSize = `${16 / scale}px`;

      // 2. Despertamos la API (tu código ya existente)
      this.despertarAPI();
    });
  }

  private despertarAPI(): void {
    this.http.get(this.apiUrl).subscribe({
      next: (response) => console.log('API despierta:', response),
      error: (err) => console.warn('Error al despertar la API:', err),
    });
  }
}
