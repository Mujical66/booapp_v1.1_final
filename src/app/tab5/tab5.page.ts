import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonAvatar,
  IonList,
  IonToast,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule, Location } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  exit,
  help,
  chevronBackOutline,
  warningOutline,
  camera,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonAvatar,
    IonList,
    IonToast,
    IonIcon,
    IonButtons,
  ],
})
export class Tab5Page implements OnInit {
  usuarioActual: any;
  editando: boolean = false;
  formPerfil!: FormGroup;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';
  private apiUrl =
    'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colusuario';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient,
    private location: Location
  ) {
    addIcons({ chevronBackOutline, camera, warningOutline, exit, help });
  }

  ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    this.initForm();
  }

  volverATab1() {
    this.location.back();
    // this.router.navigate(['/tabs/tab1']);
  }

  initForm() {
    this.formPerfil = this.fb.group({
      IdDni: [this.usuarioActual?.IdDni || '', Validators.required],
      nombre: [this.usuarioActual?.nombre || '', Validators.required],
      password: [''],
    });
  }

  iniciarEdicion() {
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
    this.formPerfil.reset({
      IdDni: this.usuarioActual?.IdDni,
      nombre: this.usuarioActual?.nombre,
      password: '',
    });
  }

  guardarCambios() {
    if (this.formPerfil.invalid) return;

    const cambios = {
      IdDni: this.formPerfil.value.IdDni,
      nombre: this.formPerfil.value.nombre,
      ...(this.formPerfil.value.password && {
        password: this.formPerfil.value.password,
      }),
    };

    this.http
      .patch(`${this.apiUrl}/${this.usuarioActual._id}`, cambios)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            const usuarioActualizado = { ...this.usuarioActual, ...cambios };
            this.authService.setUsuarioActual(usuarioActualizado); // Actualiza en AuthService y localStorage
            this.usuarioActual = usuarioActualizado;
            this.mostrarMensaje('Perfil actualizado', 'success');
            this.editando = false;
          } else {
            this.mostrarMensaje('Error al actualizar', 'danger');
          }
        },
        error: (err) => {
          this.mostrarMensaje('Error en la conexión', 'danger');
        },
      });
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message:
        '¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => this.eliminarCuenta(),
        },
      ],
    });
    await alert.present();
  }

  eliminarCuenta() {
    this.http.delete(`${this.apiUrl}/${this.usuarioActual._id}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.mostrarMensaje('Cuenta eliminada', 'success');
          this.authService.cerrarSesion();
          this.router.navigate(['/home']);
        } else {
          this.mostrarMensaje('Error al eliminar', 'danger');
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error en la conexión', 'danger');
      },
    });
  }

  private mostrarMensaje(mensaje: string, color: string = 'danger') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }

  async cambiarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 500,
        height: 500,
      });

      if (image?.dataUrl) {
        // Actualiza la vista previa inmediatamente
        this.usuarioActual.fotoPerfil = image.dataUrl;

        // Sube la imagen al servidor
        await this.actualizarFotoPerfil(image.dataUrl);
      }
    } catch (error) {
      this.mostrarMensaje('Error al tomar la foto', 'danger');
      console.error('Error al tomar foto:', error);
    }
  }

  private async actualizarFotoPerfil(fotoDataUrl: string) {
    try {
      const formData = new FormData();
      const blob = this.dataURItoBlob(fotoDataUrl);
      formData.append('fotoPerfil', blob, 'profile.jpg');

      this.http
        .patch(`${this.apiUrl}/${this.usuarioActual._id}`, formData)
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              // Asegúrate que response.data contenga la propiedad correcta
              const nombreArchivo =
                response.data?.fotoPerfil ||
                response.data?.colusuario?.fotoPerfil;

              if (!nombreArchivo) {
                throw new Error(
                  'El servidor no devolvió el nombre del archivo'
                );
              }

              // Actualiza el usuario localmente
              const usuarioActualizado = {
                ...this.usuarioActual,
                fotoPerfil: nombreArchivo,
              };

              // Actualiza en AuthService y localStorage
              this.authService.setUsuarioActual(usuarioActualizado);

              // Actualiza la referencia local
              this.usuarioActual = usuarioActualizado;

              this.mostrarMensaje('Foto actualizada', 'success');
            } else {
              throw new Error(
                response?.message || 'Error en la respuesta del servidor'
              );
            }
          },
          error: (error) => {
            this.usuarioActual.fotoPerfil = fotoDataUrl;
            this.mostrarMensaje('Error al guardar la foto', 'danger');
            console.error('Error:', error);
          },
        });
    } catch (error) {
      this.usuarioActual.fotoPerfil = fotoDataUrl;
      this.mostrarMensaje('Error al procesar la imagen', 'danger');
      console.error('Error:', error);
    }
  }

  // Añade este método para convertir DataURL a Blob
  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeType });
  }

  getFotoUrl(fotoPerfil: string): string {
    // Si es una data URL (imagen temporal)
    if (fotoPerfil?.startsWith('data:image')) {
      return fotoPerfil;
    }
    // Si es un nombre de archivo válido
    else if (fotoPerfil && !fotoPerfil.startsWith('assets/')) {
      return `https://s3-uploadimages-booapp-bucket.s3.us-east-2.amazonaws.com/${fotoPerfil}`;
    }
    // Imagen por defecto
    return 'assets/logoFantasma.png';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/logoFantasma.png';
  }
}
