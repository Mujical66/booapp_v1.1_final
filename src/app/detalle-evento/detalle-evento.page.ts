import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  selector: 'app-detalle-evento',
  templateUrl: 'detalle-evento.page.html',
  styleUrls: ['detalle-evento.page.scss'],
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonButton
  ]
})
export class DetalleEventoPage implements OnInit {
  evento: Evento | undefined;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id) {
      this.http.get<Evento[]>('./assets/data/eventos.json').subscribe(data => {
        this.evento = data.find(e => e.id === id);
      });
    }
  }
}