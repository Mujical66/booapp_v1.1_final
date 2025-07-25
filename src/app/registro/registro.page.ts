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
  IonToast,
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
    IonToast,
  ],
})
export class RegistroPage implements OnInit {
  nuevoUsuario = {
    IdDni: '',
    nombre: '',
    email: '',
    password: '',
    rol: 'Turista',
    fotoPerfil: 'assets/vacia.jpg',
    activo: 1,
    fechaIngreso: new Date().toISOString(),
    ultimaActividad: new Date().toISOString(),
  };

  usuariosExistentes: any[] = [];
  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform
  ) {}

  async ngOnInit() {
    this.cargarUsuarios();
    // Si no se tomó foto, fotoPerfil ya tendrá la base64
    this.nuevoUsuario.fotoPerfil = await this.loadDefaultPhoto();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      (window as any).plugins && (window as any).plugins.insomnia.keepAwake();
    });
  }

  ionViewWillLeave() {
    this.platform.ready().then(() => {
      (window as any).plugins &&
        (window as any).plugins.insomnia.allowSleepAgain();
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.authService.cargarUsuarios().subscribe({
      next: (response) => {
        this.authService.cargarUsuarios().subscribe((usuarios) => {
          this.usuariosExistentes = usuarios;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.loading = false;
      },
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
      },
    });
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 50,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 700,
        height: 700,
      });

      if (image?.dataUrl) {
        this.nuevoUsuario.fotoPerfil = image.dataUrl; // se reemplaza sólo si existe
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.toastMessage = 'No se pudo tomar la foto.';
      this.showToast = true;
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/imgNoFoto.png'; // Ruta de la imagen por defecto';
  }

  async retornar() {
    this.router.navigate(['/home']);
  }

  private async loadDefaultPhoto(): Promise<string> {
    // Usamos fetch para leer el archivo y convertirlo a base64
    const res = await fetch('assets/imgNoFoto.png');
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
