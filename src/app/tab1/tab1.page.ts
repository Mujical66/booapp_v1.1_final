import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonSearchbar,
  IonCardSubtitle,
  IonAlert
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { Platform } from '@ionic/angular';

export interface Evento {
  _id: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  fechaCreacion: string; // Puedes convertirlo a Date si lo necesitas
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
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonSearchbar,
    IonCardSubtitle,
    IonAlert
  ]
})
export class Tab1Page implements OnInit {
  @ViewChild(IonAlert) miAlerta!: IonAlert;

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  mensajeNoResultados: string = '';
  eventoMasReciente: Evento | null = null;
  apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colevento';

  alertButtons = [
    {
      text: 'Verlo Ahora',
      handler: () => {
        if (this.eventoMasReciente) {
          this.router.navigate(['/detalle-evento', this.eventoMasReciente._id]);
        }
      }
    },
    {
      text: 'Después',
      role: 'cancel'
    }
  ];

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.http.get<{ success: boolean; message: string; data: { colEventosleps: Evento[] } }>(this.apiUrl).subscribe({
      next: (response) => {
        if (response.success) {
          this.eventos = response.data.colEventosleps;
          this.eventosFiltrados = [...this.eventos];
          this.mostrarEventoMasReciente();
        } else {
          console.warn('API no devolvió éxito:', response.message);
          this.mensajeNoResultados = 'No se encontraron eventos.';
        }
      },
      error: (err) => {
        console.error('Error al cargar eventos desde la API:', err);
        this.mensajeNoResultados = 'No se pudieron cargar los eventos.';
      }
    });
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }

  // Método para encontrar y mostrar el evento más reciente
  async mostrarEventoMasReciente() {
    if (this.eventos.length === 0) {
      console.warn('No hay eventos disponibles.');
      return;
    }

    const parseFecha = (fechaStr: string): Date => {
      return new Date(fechaStr); // Ya es compatible con fechas ISO
    };

    const eventosOrdenados = [...this.eventos].sort((a, b) => {
      const fechaA = parseFecha(a.fechaCreacion);
      const fechaB = parseFecha(b.fechaCreacion);
      return isNaN(fechaA.getTime()) || isNaN(fechaB.getTime())
        ? 0
        : fechaB.getTime() - fechaA.getTime();
    });

    this.eventoMasReciente = eventosOrdenados[0] || null;

    // Mostrar alert automáticamente si estamos en dispositivo móvil
    if (this.platform.is('capacitor')) {
      setTimeout(() => {
        this.miAlerta.present();
      }, 300);
    } else {
      this.miAlerta.present();
    }
  }

  aplicarFiltro(termino: string) {
    termino = termino?.toLowerCase() || '';
    if (!termino) {
      this.eventosFiltrados = this.eventos;
      return;
    }
    this.eventosFiltrados = this.eventos.filter(evento =>
      evento.titulo.toLowerCase().includes(termino) ||
      evento.ubicacion.toLowerCase().includes(termino)
    );

    if (this.eventosFiltrados.length === 0) {
      this.mensajeNoResultados = 'No se encontraron eventos.';
    } else {
      this.mensajeNoResultados = '';
    }
  }
}