import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonButtons,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiBooappService } from '../services/api-booapp.service';
import { addIcons } from 'ionicons';
import { exit, help, chevronBackOutline, warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    NgIf,
    NgFor,
    IonIcon,
    IonSpinner,
    IonButtons,
  ],
})
export class Tab2Page implements OnInit {
  data: any[] = [];
  eventosActivos: any[] = []; // Nueva propiedad para almacenar solo eventos activos
  public cargandor: boolean = true;
  mensajeNoResultados: string = ''; // Mensaje cuando no hay eventos activos
  cargando: boolean = true;

  constructor(
    private apiService: ApiBooappService,
    private router: Router,
    private location: Location
  ) {
    addIcons({ chevronBackOutline, warningOutline, exit, help });
  }

  ngOnInit(): void {
    this.llenarDatos();
  }

  llenarDatos() {
    this.cargando = true;
    this.apiService.getData().subscribe({
      next: (response) => {
        setTimeout(() => {
          this.data = response.data?.colEventosleps || [];

          // Filtrar solo eventos activos
          this.eventosActivos = this.data.filter(
            (evento: any) => evento.estado === 'Activo'
          );

          this.cargandor = false;

          if (this.eventosActivos.length === 0) {
            this.mensajeNoResultados = 'No hay eventos activos disponibles.';
          }

          console.log('Eventos activos obtenidos:', this.eventosActivos);
        }, 1000);
        this.cargando = false; // Finaliza la carga (éxito)
      },
      error: (error) => {
        this.cargandor = false;
        this.mensajeNoResultados = 'Error al cargar eventos activos.';
        console.error('Error al obtener los datos:', error);
      },
    });
  }

  verMapa(item: any) {
    this.router.navigate(['/mapa'], {
      queryParams: {
        titulo: item.titulo,
        latitud: item.latitud,
        longitud: item.longitud,
        ubicacion: item.ubicacion,
      },
    });
  }

  mostrarCargando() {
    this.cargandor = true;
    setTimeout(() => {
      this.cargandor = false;
    }, 2000);
  }

  volverATab1() {
    this.location.back();
    // this.router.navigate(['/tabs/tab1']);
  }
}
