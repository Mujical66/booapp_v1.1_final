import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonBadge,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiBooappService } from '../services/api-booapp.service';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { addIcons } from 'ionicons';
import { exit } from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    NgIf,
    NgFor,
    IonBadge,
    IonButtons,
    IonIcon,
  ],
})
export class Tab4Page implements OnInit {
  data: any[] = [];
  cargando: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiBooappService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    addIcons({ exit });
  }

  ngOnInit() {
    this.apiService.eventos$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (eventos) => {
        const usuarioActual = this.authService.getUsuarioActual();
        console.log('Rol del Usuario ' + usuarioActual?.rol);
        if (usuarioActual?.rol != 'admin') {
          console.log('Es diferente de admin');
          if (usuarioActual && usuarioActual._id) {
            // Filtrar eventos por idUsuario del usuario autenticado
            this.data = eventos.filter(
              (evento) => evento.idUsuario === usuarioActual._id
            );
          } else {
            this.data = []; // Si no hay usuario autenticado, mostramos lista vacía
            console.warn('No hay usuario autenticado');
          }
        } else {
          this.data = eventos;
        }
        this.cargando = false;
        console.log('Datos filtrados en Tab4:', this.data);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al actualizar datos:', error);
      },
    });
    this.apiService.cargarEventos();
  }

  ionViewWillEnter() {
    this.cargando = true;
    this.apiService.cargarEventos();
  }

  agregar() {
    this.navCtrl.navigateRoot('nuevo-evento/');
  }

  editarEvento(item: any) {
    this.router.navigate(['editar'], {
      queryParams: {
        _id: item._id,
        idCodEvento: item.idCodEvento,
        titulo: item.titulo,
        descripcion: item.descripcion,
        ubicacion: item.ubicacion,
        latitud: item.latitud,
        longitud: item.longitud,
        fechaCreacion: item.fechaCreacion,
        imagen: item.imagen,
        video: item.video,
        comentario: item.comentario,
        popularidad: item.popularidad,
        estado: item.estado,
        fechaVisual: item.fechaVisual,
        comentarioRev: item.comentarioRev,
        tipoContenido: item.tipoContenido,
        idUsuario: item.idUsuario,
      },
    });
  }

  async eliminarEvento(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Está seguro de eliminar este registro?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: () => {
            this.apiService.eliminarEvento(item._id || item.id).subscribe({
              next: async () => {
                this.apiService.cargarEventos(); // Recarga los eventos
                const successAlert = await this.alertCtrl.create({
                  header: 'Eliminado',
                  message: 'Registro eliminado con éxito',
                  buttons: [],
                  backdropDismiss: true,
                });
                await successAlert.present();

                setTimeout(() => {
                  successAlert.dismiss();
                }, 2000);
              },
              error: async () => {
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'Error al eliminar el registro',
                  buttons: [],
                  backdropDismiss: true,
                });
                await errorAlert.present();

                setTimeout(() => {
                  errorAlert.dismiss();
                }, 2000);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  // En tu tab4.page.ts
  get esAdmin(): boolean {
    return this.authService.getUsuarioActual()?.rol === 'admin';
  }

  // Añade estas funciones en tu Tab4Page

  async aprobarEvento(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Aprobación',
      message:
        '¿Está seguro de aprobar este evento?, ¿Ya cargo las coordenadas de ubicación del mismo y el comentario de revisión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aprobar',
          handler: () => {
            this.actualizarEstadoEvento(
              item._id,
              'Activo',
              'Evento aprobado con éxito'
            );
          },
        },
      ],
    });
    await alert.present();
  }

  async rechazarEvento(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Rechazo',
      message:
        '¿Está seguro de rechazar este evento? ¿Coloco un comentario de revisión con el motivo del rechazo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Rechazar',
          handler: () => {
            this.actualizarEstadoEvento(
              item._id,
              'Cancelado',
              'Evento rechazado'
            );
          },
        },
      ],
    });
    await alert.present();
  }

  private actualizarEstadoEvento(
    eventoId: string,
    nuevoEstado: string,
    mensajeExito: string
  ) {
    this.apiService.actualizarEstadoEvento(eventoId, nuevoEstado).subscribe({
      next: async () => {
        this.apiService.cargarEventos(); // Recargar la lista de eventos

        const toast = await this.toastCtrl.create({
          message: mensajeExito,
          duration: 2000,
          color: 'success',
          position: 'top',
        });
        await toast.present();
      },
      error: async (error) => {
        console.error('Error al actualizar estado:', error);

        const toast = await this.toastCtrl.create({
          message: 'Error al actualizar el estado del evento',
          duration: 2000,
          color: 'danger',
          position: 'top',
        });
        await toast.present();
      },
    });
  }

  async salir() {
    // Verificar si hay un usuario logueado (admin o turista)
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
              this.authService.cerrarSesion(); // Cierra sesión solo si está logueado
            }
            this.router.navigate(['/home']); // Redirige al inicio en ambos casos
          },
        },
      ],
    };

    const alert = await this.alertController.create(alertConfig);
    await alert.present();
  }
}
