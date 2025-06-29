import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonRow, IonCol, LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonGrid, IonRow, IonCol]
})
export class HomePage implements OnInit {

  cargandoInicial = true;

  constructor(private navCtrl: NavController, private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    // // Mostrar loader por 15 segundos
    // setTimeout(() => {
    //   this.cargandoInicial = false;
    // }, 15000);

    // Opcional: Hacer una petición de prueba para "despertar" la API
    await this.despertarAPI();
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
    // this.navCtrl.navigateRoot('/registro');
  }
}
