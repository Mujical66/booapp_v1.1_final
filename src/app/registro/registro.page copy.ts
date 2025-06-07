import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
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

interface Usuario {
  _id?: string;
  IdDni: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  fotoPerfil: string; // Base64 o URL
  activo: number;
  fechaIngreso: string;
  ultimaActividad: string;
}

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
    IonTitle,
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
    rol: 'Turista', // valor por defecto
    fotoPerfil: '', // almacenará la imagen en base64
    activo: 1,
    fechaIngreso: new Date().toISOString(),
    ultimaActividad: new Date().toISOString()
  };

  usuariosExistentes: Usuario[] = [];
  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colusuario';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.http.get<{ success: boolean; data: { colusuario: Usuario[] } }>(this.apiUrl).subscribe({
      next: (response) => {
        if (response.success && response.data?.colusuario) {
          this.usuariosExistentes = response.data.colusuario;
        }
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

    const existe = this.usuariosExistentes.some(u => u.email === email);
    if (existe) {
      this.toastMessage = 'El correo ya está registrado.';
      this.showToast = true;
      return;
    }

    const formData = new FormData();
    formData.append('IdDni', IdDni);
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('rol', this.nuevoUsuario.rol);
    formData.append('activo', String(this.nuevoUsuario.activo));
    formData.append('fechaIngreso', this.nuevoUsuario.fechaIngreso);
    formData.append('ultimaActividad', this.nuevoUsuario.ultimaActividad);

    // Si hay imagen, se adjunta
    if (this.nuevoUsuario.fotoPerfil) {
      const blob = this.dataURItoBlob(this.nuevoUsuario.fotoPerfil);
      formData.append('fotoPerfil', blob, 'perfil.jpg');
    }

    this.http.post(this.apiUrl, formData).subscribe({
      next: (res) => {
        console.log('Usuario creado:', res);
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.toastMessage = 'Hubo un problema al registrar el usuario.';
        this.showToast = true;
      }
    });
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
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
}