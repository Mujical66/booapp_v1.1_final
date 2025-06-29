import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButtons, IonBackButton, IonAlert
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButtons, IonBackButton, IonAlert,
    CommonModule, FormsModule,
  ],
})
export class MapaPage implements OnInit {
  titulo: string = '';
  latitud: number = 0;
  longitud: number = 0;
  ubicacion: string = '';
  map!: mapboxgl.Map;
  showPermissionAlert = false;

  // Límites geográficos de Venezuela
  private readonly VENEZUELA_BOUNDS = {
    minLat: 0.6,    // Punto más al sur (Amazonas)
    maxLat: 15.7,   // Punto más al norte (Isla de Aves)
    minLng: -73.4,  // Punto más al oeste (Zulia)
    maxLng: -59.8   // Punto más al este (Delta Amacuro)
  };

  // Puntos de ubicación
  puntoActual = { lat: 0, lng: 0 };
  puntoEvento = { lat: 0, lng: 0 };

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    await this.obtenerUbicacionActual();
    this.obtenerParametrosRuta();
  }

  private async obtenerUbicacionActual() {
    try {
      // 1. Verificar permisos
      const estadoPermisos = await this.verificarPermisos();
      
      if (estadoPermisos.location !== 'granted') {
        this.showPermissionAlert = true;
        throw new Error('Permisos no concedidos');
      }

      // 2. Obtener ubicación
      const position = await this.obtenerPosicionActual();
      
      // 3. Validar coordenadas
      if (this.estaEnVenezuela(position.coords.latitude, position.coords.longitude)) {
        this.puntoActual = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
      } else {
        console.warn('Ubicación fuera de Venezuela, usando Caracas');
        this.puntoActual = { lat: 10.4806, lng: -66.9036 };
      }
    } catch (error) {
      console.error('Error en geolocalización:', error);
      this.puntoActual = { lat: 10.4806, lng: -66.9036 };
    }
  }

  private async verificarPermisos(): Promise<PermissionStatus> {
    try {
      let estado = await Geolocation.checkPermissions();
      
      if (estado.location !== 'granted') {
        // En iOS, necesitamos especificar el propósito en el info.plist
        estado = await Geolocation.requestPermissions();
      }
      
      return estado;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      throw error;
    }
  }

  private async obtenerPosicionActual() {
    try {
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } catch (error) {
      console.error('Error obteniendo posición:', error);
      throw error;
    }
  }

  // Resto del código permanece igual...
  private obtenerParametrosRuta() {
    this.route.queryParams.subscribe(params => {
      this.titulo = params['titulo'] || 'Evento Paranormal';
      this.ubicacion = params['ubicacion'] || 'Ubicación desconocida';

      const lat = Number(params['latitud']);
      const lng = Number(params['longitud']);

      if (this.estaEnVenezuela(lat, lng)) {
        this.latitud = lat;
        this.longitud = lng;
      } else {
        this.latitud = 10.4806;
        this.longitud = -66.9036;
      }

      this.puntoEvento = { lat: this.latitud, lng: this.longitud };
      setTimeout(() => this.inicializarMapa(), 100);
    });
  }

  private estaEnVenezuela(lat: number, lng: number): boolean {
    return (
      lat >= this.VENEZUELA_BOUNDS.minLat &&
      lat <= this.VENEZUELA_BOUNDS.maxLat &&
      lng >= this.VENEZUELA_BOUNDS.minLng &&
      lng <= this.VENEZUELA_BOUNDS.maxLng
    );
  }

  private inicializarMapa() {
    const centerLng = (this.puntoActual.lng + this.puntoEvento.lng) / 2;
    const centerLat = (this.puntoActual.lat + this.puntoEvento.lat) / 2;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [centerLng, centerLat],
      zoom: 12,
      accessToken: environment.mapboxAccessToken
    });

    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.agregarMarcadores();
      this.trazarRuta();
      this.ajustarVista();
    });
  }

  private agregarMarcadores() {
    new mapboxgl.Marker({ color: '#2E86C1' })
      .setLngLat([this.puntoActual.lng, this.puntoActual.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <h3>Tu ubicación</h3>
        <p>Lat: ${this.puntoActual.lat.toFixed(4)}</p>
        <p>Lng: ${this.puntoActual.lng.toFixed(4)}</p>
      `))
      .addTo(this.map);

    new mapboxgl.Marker({ color: '#E74C3C' })
      .setLngLat([this.puntoEvento.lng, this.puntoEvento.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <h3>${this.titulo}</h3>
        <p>${this.ubicacion}</p>
        <p>Lat: ${this.puntoEvento.lat.toFixed(4)}</p>
        <p>Lng: ${this.puntoEvento.lng.toFixed(4)}</p>
      `))
      .addTo(this.map);
  }

  private async trazarRuta() {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.puntoActual.lng},${this.puntoActual.lat};${this.puntoEvento.lng},${this.puntoEvento.lat}?geometries=geojson&access_token=${environment.mapboxAccessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;

        if (this.map.getSource('ruta')) {
          (this.map.getSource('ruta') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            geometry: route,
            properties: {}
          });
        } else {
          this.map.addSource('ruta', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route,
              properties: {}
            }
          });

          this.map.addLayer({
            id: 'ruta',
            type: 'line',
            source: 'ruta',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#8E44AD',
              'line-width': 4,
              'line-opacity': 0.7
            }
          });
        }
      }
    } catch (error) {
      console.error('Error trazando ruta:', error);
    }
  }

  private ajustarVista() {
    const bounds = new mapboxgl.LngLatBounds()
      .extend([this.puntoActual.lng, this.puntoActual.lat])
      .extend([this.puntoEvento.lng, this.puntoEvento.lat]);

    this.map.fitBounds(bounds, {
      padding: 100,
      maxZoom: 14
    });
  }

  async onPermissionAlertDismiss() {
    this.showPermissionAlert = false;
    // Intenta nuevamente obtener la ubicación
    await this.obtenerUbicacionActual();
  }
}