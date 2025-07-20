/* 
NOMBRE: api-booapp.service.ts
DESCRIPCION: Servicio para manejar las peticiones a la API de BooApp.
DESARROLLADOR: Luis Mujica
FECHA: 2025-06-03
PROYECTO: BooApp
VERSION: 1.0.0  
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBooappService {
  private urlApi = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws';
  private eventosSubject = new BehaviorSubject<any[]>([]);
  eventos$ = this.eventosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== EVENTOS PARANORMALES ====================
  /**
   * Obtiene la lista de eventos paranormales desde la API.
   * @returns Observable con los datos de los eventos.
   */
  public getData(): Observable<any> {
    const timestamp = new Date().getTime(); // Evita caché
    return this.http.get<any>(`${this.urlApi}/colevento?t=${timestamp}`);
  }

  /**
   * Actualiza un evento por su ID.
   * @param id - ID del evento a actualizar.
   * @param body - Datos del evento a actualizar.
   * @param options - Opciones adicionales para la solicitud (por ejemplo, headers).
   * @returns Observable con la respuesta de la actualización.
   */
  public actualizarEvento(
    id: string,
    body: any,
    options: any = {}
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.urlApi}/colevento/${id}`,
      body,
      options
    );
  }

  /**
   * Elimina un evento por su ID.
   * @param id - ID del evento a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  public eliminarEvento(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlApi}/colevento/${id}`);
  }

  /**
   * Carga la lista de eventos desde la API y notifica a los suscriptores.
   */
  public cargarEventos(): void {
    this.getData().subscribe({
      next: (response) => {
        this.eventosSubject.next(response.data?.colEventosleps || []);
        console.log(
          'Eventos cargados en el servicio:',
          response.data?.colEventosleps
        );
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.eventosSubject.next([]);
      },
    });
  }

  actualizarEstadoEvento(
    eventoId: string,
    nuevoEstado: string
  ): Observable<any> {
    return this.http.patch(`${this.urlApi}/colevento/${eventoId}`, {
      estado: nuevoEstado,
      fechaRevision: new Date().toISOString(), // Opcional: registrar fecha de revisión
      // idUsuarioRevisor: this.authService.getUsuarioActual()?._id // Descomenta si necesitas guardar quién revisó
    });
  }
}
