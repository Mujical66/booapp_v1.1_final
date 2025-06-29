import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Platform } from '@ionic/angular';

// Interfaz del evento
export interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  fechaCreacion: string;
  imagen?: string;
  video?: string;
  tipoContenido?: string;
  comentario?: string;
  popularidad?: number;
  estado?: string;
  fechaVisual?: string;
  idCodEvento?: string;
  idUsuario?: string;
}

// Interfaz completa de la respuesta de la API
export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    Eventos: Evento; // El campo se llama "Eventos" según la estructura devuelta por la API
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento';

  constructor(private http: HttpClient, private platform: Platform) { }

  obtenerEventos(): Observable<{ success: boolean; message: string; data: { colEventosleps: Evento[] } }> {
    return this.http.get<{ success: boolean; message: string; data: { colEventosleps: Evento[] } }>(this.apiUrl);
  }

  esDispositivoMovil(): boolean {
    return this.platform.is('mobile') || this.platform.is('mobileweb') || this.platform.is('capacitor');
  }

  obtenerEventoMasReciente(eventos: Evento[]): Evento | null {
    if (eventos.length === 0) return null;

    const parseFecha = (fechaStr: string): Date => new Date(fechaStr);

    const eventosOrdenados = [...eventos].sort((a, b) => {
      const fechaA = parseFecha(a.fechaCreacion);
      const fechaB = parseFecha(b.fechaCreacion);
      return isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())
        ? 0
        : fechaB.getTime() - fechaA.getTime();
    });

    return eventosOrdenados[0];
  }

  // Método corregido para recibir el evento correctamente
  obtenerEventoPorId(id: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  crearEvento(evento: FormData) {
    return this.http.post(
      'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento',
      evento
    );
  }
}