// tab1.page.ts
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
} from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { EventosService, Evento } from '../services/eventos.service';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta
import { addIcons } from 'ionicons';
import { exit, help } from 'ionicons/icons';
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
  ],
})
export class Tab1Page implements OnInit {
  @ViewChild(IonAlert) miAlerta!: IonAlert;

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  mensajeNoResultados: string = '';
  eventoMasReciente: Evento | null = null;
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

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
    addIcons({ exit, help });
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      this.isDarkMode = e.matches;
    });
  }

  ngOnInit(): void {
    this.cargarEventos();
  }

  async salir() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert', // Clase CSS personalizada
      header: 'Confirmar',
      message: '¿Desea cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button',
        },
        {
          text: 'Sí, salir',
          cssClass: 'exit-button',
          handler: () => {
            this.authService.cerrarSesion();
            this.router.navigate(['/home']);
          },
        },
      ],
    });

    await alert.present();
  }

  cargarEventos(): void {
    this.eventosService.obtenerEventos().subscribe({
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
        console.error('Error al cargar eventos:', err);
        this.mensajeNoResultados = 'No se pudieron cargar los eventos.';
      },
    });
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }

  async mostrarEventoMasReciente() {
    this.eventoMasReciente = this.eventosService.obtenerEventoMasReciente(
      this.eventos
    );

    if (!this.eventoMasReciente) {
      console.warn('No hay eventos disponibles.');
      return;
    }

    // Mostrar alert automáticamente
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
      this.eventosFiltrados = this.eventos;
      return;
    }
    this.eventosFiltrados = this.eventos.filter(
      (evento) =>
        evento.titulo.toLowerCase().includes(termino) ||
        evento.ubicacion.toLowerCase().includes(termino)
    );

    this.mensajeNoResultados =
      this.eventosFiltrados.length === 0 ? 'No se encontraron eventos.' : '';
  }
}
