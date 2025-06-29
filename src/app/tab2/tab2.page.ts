/* 
NOMBRE: list-mapa-ruta.page.ts
DESCRIPCION: Página de la logica para listar y gestionar la lista de las rutas de los eventos.
DESARROLLADOR: Luis Mujica
FECHA: 2025-06-09
PROYECTO: BooApp
VERSION: 1.0.0  
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  //  IonInfiniteScroll, 
  //  IonInfiniteScrollContent,
  IonButton, // <-- Agrega este import
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { ApiBooappService } from '../services/api-booapp.service';

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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    NgIf,
    NgFor,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    //    IonInfiniteScroll,
    //    IonInfiniteScrollContent,
    IonButton, // <-- Agrega este import
  ],
})
export class Tab2Page implements OnInit {
  data: any[] = [];
  public cargandor: boolean = true;

  constructor(
    private apiService: ApiBooappService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.llenarDatos();
  }

  llenarDatos() {
    this.cargandor = true;
    this.apiService.getData().subscribe({
      next: (response) => {
        setTimeout(() => {
          this.data = response.data?.colEventosleps || [];
          this.cargandor = false;
          console.log('Datos obtenidos:', this.data);
        }, 1000); // 1.2 segundos de retardo para ver el spinner
      },
      error: (error) => {
        this.cargandor = false;
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
        ubicacion: item.ubicacion
      },
    });
  }

  mostrarCargando() {
    this.cargandor = true;
    setTimeout(() => {
      this.cargandor = false;
    }, 2000); // 2 segundos para ver el spinner
  }
}
