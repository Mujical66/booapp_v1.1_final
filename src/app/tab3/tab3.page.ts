import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { exit, help, chevronBackOutline, warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
  ],
})
export class Tab3Page {
  mensajePredeterminado =
    'BooApp es una aplicación que te permite explorar y descubrir los Mitos y Leyendas de la ciudad de Caracas. Con una interfaz intuitiva y con un contenido enriquecedor, es perfecta para quienes aman las historias fascinantes y ocultas';
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  constructor(
    private platform: Platform,
    private router: Router,
    private location: Location,
  ) {
    addIcons({ chevronBackOutline, warningOutline, exit, help });
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      this.isDarkMode = e.matches;
    });
  }

  compartirWhatsApp() {
    const texto = encodeURIComponent(this.mensajePredeterminado);
    let url = '';

    // Para dispositivos móviles (Android, iOS)
    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      url = `whatsapp://send?text=${texto}`;
    } else {
      // Para navegadores desktop abrir WhatsApp Web
      url = `https://web.whatsapp.com/send?text=${texto}`;
    }

    window.open(url, '_blank');
  }

  volverATab1() {
    this.location.back();
    // this.router.navigate(['/tabs/tab1']);
  }
}
