import { Component, OnInit } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner,
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiBooappService } from '../services/api-booapp.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonCard,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner,
    NgIf, NgFor,
  ],
})
export class Tab4Page implements OnInit {
  data: any[] = [];
  cargando: boolean = true;

  constructor(
    private apiService: ApiBooappService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.apiService.eventos$.subscribe({
      next: (eventos) => {
        this.data = eventos;
        this.cargando = false;
        console.log('Datos actualizados en Tab4:', this.data);
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
}