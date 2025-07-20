import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../services/eventos.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

import { AuthService } from '../services/auth.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: 'detalle-evento.page.html',
  styleUrls: ['detalle-evento.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
  ],
})
export class DetalleEventoPage implements OnInit {
  evento: any = null;
  loading: boolean = true;
  nombreUsuario: string = 'Cargando...'; // Valor inicial mientras se carga el nombre
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private eventosService: EventosService,
    private authService: AuthService, // Inyecta AuthService
    private router: Router // Añade Router para navegación programática
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID recibido:', id); // 👈 Añade este log

    if (id) {
      this.cargarEvento(id);
    } else {
      this.loading = false;
      console.error('No se recibió ID de evento');
    }
  }

  cargarEvento(id: string) {
    this.eventosService.obtenerEventoPorId(id).subscribe({
      next: (response) => {
        console.log('Respuesta API:', response); // <-- Muy útil para ver qué llega

        if (response.success && response.data?.Eventos) {
          this.evento = response.data.Eventos;

          // Obtener el nombre del usuario basado en idUsuario
          if (this.evento.idUsuario) {
            this.authService
              .getNombreUsuarioById(this.evento.idUsuario)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (nombre) => {
                  this.nombreUsuario = nombre;
                },
                error: (err) => {
                  console.error('Error al obtener nombre de usuario:', err);
                  this.nombreUsuario = 'Usuario no encontrado';
                },
              });
          } else {
            this.nombreUsuario = 'Sin usuario asociado';
          }
        } else {
          console.error('Evento no encontrado o respuesta inválida');
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error HTTP:', err);
        this.loading = false;
      },
    });
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }

  volverAEventos() {
    const rutaDestino = this.authService.estaAutenticado()
      ? '/tabs-user'
      : '/tabs';
    this.router.navigate([rutaDestino]);
  }
}
