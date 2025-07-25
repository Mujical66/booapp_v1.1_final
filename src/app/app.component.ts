import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent implements OnInit {
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws';

  constructor(private http: HttpClient, private platform: Platform) {}

  async ngOnInit(): Promise<void> {
    await this.platform.ready();

    // Configuración de la Status Bar
    await this.configureStatusBar();

    // Despertar API (tu código existente)
    this.despertarAPI();
  }

  private async configureStatusBar(): Promise<void> {
    try {
      // Asegurar que la Status Bar no solape el contenido
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Configurar el estilo según tu tema (Dark o Light)
      await StatusBar.setStyle({
        style: Style.Dark, // Puedes usar Style.Light si tu tema es claro
      });

      // Opcional: Configurar color de fondo (Android específico)
      if (this.platform.is('android')) {
        await StatusBar.setBackgroundColor({ color: '#000000' }); // Negro
      }
    } catch (error) {
      console.warn('Error al configurar StatusBar:', error);
    }
  }

  private despertarAPI(): void {
    this.http.get(this.apiUrl).subscribe({
      next: (response) => console.log('API despierta:', response),
      error: (err) => console.warn('Error al despertar la API:', err),
    });
  }
}
