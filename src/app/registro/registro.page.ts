// src/app/registro/registro.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonToast
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: 'registro.page.html',
  styleUrls: ['registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonItem,
    IonLabel,
    IonButton,
    IonToast
  ]
})
export class RegistroPage implements OnInit {
  nuevoUsuario = {
    IdDni: '',
    nombre: '',
    email: '',
    password: '',
    rol: 'Turista',
    fotoPerfil: '',
    activo: 1,
    fechaIngreso: new Date().toISOString(),
    ultimaActividad: new Date().toISOString()
  };

  usuariosExistentes: any[] = [];
  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      (window as any).plugins && (window as any).plugins.insomnia.keepAwake();
    });
  }

  ionViewWillLeave() {
    this.platform.ready().then(() => {
      (window as any).plugins && (window as any).plugins.insomnia.allowSleepAgain();
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.authService.cargarUsuarios().subscribe({
      next: (response) => {
        this.authService.cargarUsuarios().subscribe(usuarios => {
          this.usuariosExistentes = usuarios;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loading = false;
      }
    });
  }

  async guardar() {
    const { IdDni, nombre, email, password, fotoPerfil } = this.nuevoUsuario;

    if (!IdDni || !nombre || !email || !password) {
      this.toastMessage = 'Por favor, completa todos los campos.';
      this.showToast = true;
      return;
    }

    const existe = this.usuariosExistentes.some((u: any) => u.email === email);
    if (existe) {
      this.toastMessage = 'El correo ya está registrado.';
      this.showToast = true;
      return;
    }

    this.authService.registrarUsuario(this.nuevoUsuario, fotoPerfil).subscribe({
      next: (res) => {
        console.log('Usuario creado:', res);
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.toastMessage = 'Hubo un problema al registrar el usuario.';
        this.showToast = true;
      }
    });
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 700,
        height: 700,
      });

      if (image && image.dataUrl) {
        this.nuevoUsuario.fotoPerfil = image.dataUrl;
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.toastMessage = 'No se pudo tomar la foto.';
      this.showToast = true;
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/noimagen.png';
  }

  async retornar() {
    this.router.navigate(['/home']);
  }
}