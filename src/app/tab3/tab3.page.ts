import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton ],
})
export class Tab3Page {
  mensajePredeterminado = '¡Hola! Te comparto esta información desde Boo App.';
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  constructor(private platform: Platform) {
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
}
