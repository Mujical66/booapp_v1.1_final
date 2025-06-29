import { Component, OnInit } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent, IonSpinner
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiBooappService } from '../services/api-booapp.service';
import { NavController } from '@ionic/angular';


// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-crud',
  templateUrl: './crud.page.html',
  styleUrls: ['./crud.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, RouterLink, IonCard,
    IonCardHeader, IonList,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent, IonSpinner, NgIf,
    NgFor]
})
export class CrudPage implements OnInit {
  data: any[] = [];
  cargando: boolean = true;

  constructor(
    private apiService: ApiBooappService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.llenarDatos();
  }
  ionViewWillEnter() {
    this.llenarDatos();
  }

  llenarDatos() {
    this.cargando = true;
    this.apiService.getData().subscribe({
      next: (response) => {
        this.data = response.data?.colEventosleps || [];
        this.cargando = false;
        console.log('Datos obtenidos:', this.data);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al obtener los datos:', error);
      },
    });
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
                this.llenarDatos();
                const successAlert = await this.alertCtrl.create({
                  header: 'Eliminado',
                  message: 'Registro eliminado con éxito',
                  buttons: [],
                  backdropDismiss: true
                });
                await successAlert.present();

                // Cerrar automáticamente después de 2 segundos
                setTimeout(() => {
                  successAlert.dismiss();
                }, 2000);

                this.navCtrl.navigateRoot('crud');
              },
              error: async () => {
                const errorAlert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'Error al eliminar el registro',
                  buttons: [],
                  backdropDismiss: true
                });
                await errorAlert.present();

                // Cerrar automáticamente después de 2 segundos
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
