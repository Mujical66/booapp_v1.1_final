import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonCard, IonCardHeader, IonCardTitle, IonSearchbar, IonCardSubtitle } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  fechaCreacion: string;
  imagen: string;
  video: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonCard,
    IonCardHeader, IonCardTitle, IonSearchbar, IonCardSubtitle
  ]
})
export class Tab1Page implements OnInit {
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  mensajeNoResultados: string = '';

  constructor(private http: HttpClient, private alertController: AlertController, private router: Router) { }

  ngOnInit(): void {
    this.http.get<Evento[]>('./assets/data/eventos.json').subscribe((data) => {
      this.eventos = data;
      this.eventosFiltrados = data;
      this.mostrarEventoMasReciente(); // Llamamos aquí para asegurar que los datos están cargados
    });
  }

  // Método para encontrar y mostrar el evento más reciente
  async mostrarEventoMasReciente() {
    if (this.eventos.length === 0) return; // Si no hay eventos, no hacemos nada

    // Ordenamos los eventos por fecha (de más reciente a más antigua)
    const eventosOrdenados = [...this.eventos].sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion.split('/').reverse().join('/')); // Formato: DD/MM/YYYY -> YYYY/MM/DD
      const fechaB = new Date(b.fechaCreacion.split('/').reverse().join('/'));
      return fechaB.getTime() - fechaA.getTime(); // Orden descendente
    });

    const eventoMasReciente = eventosOrdenados[0]; // El primer elemento es el más reciente

    const alert = await this.alertController.create({
      header: '⚠️ ¡Nuevo Evento! ⚠️',
      subHeader: `"${eventoMasReciente.titulo}"`,
      message: `👻 No pierdas tiempo 👻`,
      buttons: [
        {
          text: 'Verlo Ahora',
          handler: () => {
            this.router.navigate(['/detalle-evento', eventoMasReciente.id]);
          }
        },
        {
          text: 'Después',
          role: 'cancel'
        }
      ],
      cssClass: 'custom-alert' // (Opcional: Para estilos personalizados)
    });

    await alert.present();
  }

  aplicarFiltro(termino: string) {
    termino = termino?.toLowerCase() || '';
    if (!termino) {
      this.eventosFiltrados = this.eventos;
      return;
    }
    this.eventosFiltrados = this.eventos.filter(evento =>
      evento.titulo.toLowerCase().includes(termino) ||
      evento.ubicacion.toLowerCase().includes(termino)
    );

    if (this.eventosFiltrados.length === 0) {
      this.mensajeNoResultados = 'No se encontraron eventos.';
    } else {
      this.mensajeNoResultados = '';
    }
  }
}