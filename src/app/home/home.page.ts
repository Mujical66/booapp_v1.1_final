import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  LoadingController,
  IonFooter,
} from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonFooter,
  ],
})
export class HomePage implements OnInit {
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  cargandoInicial = true;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private alertController: AlertController
  ) {
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      this.isDarkMode = e.matches;
    });
  }

  async ngOnInit() {
    // Opcional: Hacer una petición de prueba para "despertar" la API
    await this.despertarAPI();
  }

  async closeApp() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro que deseas salir de BooApp?',
      cssClass: 'custom-alert',  
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Salir',
          handler: () => {
            this.exitApp();
          },
        },
      ],
    });

    await alert.present();
  }

  private async exitApp() {
    if (this.platform.is('capacitor')) {
      await App.exitApp();
    } else {
      console.log('En navegador no se puede cerrar la app');
      // Opcional: Puedes mostrar un mensaje al usuario en web
      const webAlert = await this.alertController.create({
        header: 'Información',
        message: 'La aplicación no puede cerrarse en versión web',
        cssClass: 'custom-alert',
        buttons: ['OK'],
      });
      await webAlert.present();
    }
  }

  async despertarAPI() {
    try {
      // Aquí puedes hacer una petición simple a tu API
      // Esto ayudará a que Render active tu servicio
      // Ejemplo:
      await fetch('https://booapp-api.onrender.com/v1/backend-api-booapp-aws');
    } catch (error) {
      console.log('Error al despertar API:', error);
    }
  }

  goToTabs() {
    this.navCtrl.navigateRoot('/tabs');
  }

  boton2() {
    this.navCtrl.navigateForward('/login');
  }

  boton3() {
    this.navCtrl.navigateForward('/registro');
  }
}
