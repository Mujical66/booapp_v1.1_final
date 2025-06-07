import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Evento {
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

@Component({
  selector: 'app-detalle-evento',
  templateUrl: 'detalle-evento.page.html',
  styleUrls: ['detalle-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton
  ]
})
export class DetalleEventoPage implements OnInit {
  evento: Evento | null = null;
  loading: boolean = true;

  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento ';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.http.get<{ success: boolean; message: string; data: { colEventosleps: Evento[] } }>(this.apiUrl).subscribe({
        next: (response) => {
          if (response.success && response.data?.colEventosleps) {
            this.evento = response.data.colEventosleps.find(e => e._id === id) || null;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar evento:', err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      console.warn('No se proporcionó un ID de evento');
    }
  }

  // Método para manejar errores de carga de imágenes
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }
}