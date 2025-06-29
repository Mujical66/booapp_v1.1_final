import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiBooappService2 {
  private eventosSubject = new BehaviorSubject<any[]>([]);
  eventos$ = this.eventosSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get('https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento');
  }

  actualizarEvento(id: string, body: any, options: any = {}) {
    return this.http.patch(`https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento/${id}`, body, options);
  }

  eliminarEvento(id: string) {
    return this.http.delete(`https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento/${id}`);
  }

  cargarEventos() {
    this.getData().subscribe({
      next: (response: any) => {
        this.eventosSubject.next(response.data?.colEventosleps || []);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.eventosSubject.next([]);
      },
    });
  }
}