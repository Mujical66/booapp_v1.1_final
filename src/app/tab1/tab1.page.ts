import { Component, OnInit, ViewChild } from '@angular/core';
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
  IonAlert,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { EventosService, Evento } from '../services/eventos.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { exit, help, chevronBackOutline } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';

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
    IonAlert,
    IonButton,
    IonIcon,
    IonButtons,
    IonSpinner,
  ],
})
export class Tab1Page implements OnInit {
  @ViewChild(IonAlert) miAlerta!: IonAlert;

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  mensajeNoResultados: string = '';
  eventoMasReciente: Evento | null = null;
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  cargando: boolean = true;

  alertButtons = [
    {
      text: 'Verlo Ahora',
      handler: () => {
        if (this.eventoMasReciente) {
          this.router.navigate(['/detalle-evento', this.eventoMasReciente._id]);
        }
      },
    },
    {
      text: 'Después',
      role: 'cancel',
    },
  ];

  constructor(
    private eventosService: EventosService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ exit, help, chevronBackOutline });
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      this.isDarkMode = e.matches;
    });
  }

  ngOnInit(): void {
    this.cargarEventos();
  }

  async salir() {
    const usuario = this.authService.getUsuarioActual();
    const alertConfig = {
      cssClass: 'custom-alert',
      header: usuario ? 'Cerrar sesión' : 'Salir de la app',
      message: usuario ? '¿Desea cerrar su sesión?' : '¿Desea salir al inicio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
        },
        {
          text: 'Sí',
          cssClass: 'exit-button',
          handler: () => {
            if (usuario) {
              this.authService.cerrarSesion();
            }
            this.router.navigate(['/home']);
          },
        },
      ],
    };

    const alert = await this.alertController.create(alertConfig);
    await alert.present();
  }

  cargarEventos(): void {
    this.cargando = true; // Inicia la carga
    this.eventosService.obtenerEventos().subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar solo eventos activos
          this.eventos = response.data.colEventosleps.filter(
            (evento: Evento) => evento.estado === 'Activo'
          );

          this.eventosFiltrados = [...this.eventos];

          if (this.eventos.length === 0) {
            this.mensajeNoResultados = 'No hay eventos activos disponibles.';
          } else {
            this.mostrarEventoMasReciente();
          }
        } else {
          console.warn('API no devolvió éxito:', response.message);
          this.mensajeNoResultados = 'No se encontraron eventos activos.';
        }
        this.cargando = false; // Finaliza la carga (éxito)
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.mensajeNoResultados = 'Error al cargar eventos activos.';
      },
    });
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }

  async mostrarEventoMasReciente() {
    // Ya están filtrados como activos, pero por si acaso
    const eventosActivos = this.eventos.filter((e) => e.estado === 'Activo');
    this.eventoMasReciente =
      this.eventosService.obtenerEventoMasReciente(eventosActivos);

    if (!this.eventoMasReciente) {
      console.warn('No hay eventos activos disponibles.');
      return;
    }

    setTimeout(
      () => {
        this.miAlerta.present();
      },
      this.eventosService.esDispositivoMovil() ? 300 : 0
    );
  }

  aplicarFiltro(termino: string) {
    termino = termino?.toLowerCase() || '';

    if (!termino) {
      this.eventosFiltrados = this.eventos; // Ya vienen filtrados como activos
      this.mensajeNoResultados =
        this.eventos.length === 0 ? 'No hay eventos activos.' : '';
      return;
    }

    this.eventosFiltrados = this.eventos.filter(
      (evento) =>
        evento.estado === 'Activo' && // Filtro redundante por seguridad
        (evento.titulo.toLowerCase().includes(termino) ||
          evento.ubicacion.toLowerCase().includes(termino))
    );

    this.mensajeNoResultados =
      this.eventosFiltrados.length === 0
        ? 'No se encontraron eventos activos con ese criterio.'
        : '';
  }
}
