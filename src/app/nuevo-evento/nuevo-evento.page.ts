import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AuthService } from '../services/auth.service';

import { EventosService } from '../services/eventos.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: 'nuevo-evento.page.html',
  styleUrls: ['nuevo-evento.page.scss'],
  standalone: true,
  imports: [
    IonicModule, CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class NuevoEventoPage implements OnDestroy {
  usuarioActual: any;
  cargando = false; // Variable para controlar el estado del loader
  registroForm: FormGroup;
  fechaActual: string = new Date().toISOString();
  imagenPrevia: string | undefined;
  videoPrevia: SafeUrl | undefined;
  esVideo: boolean = false;
  nombreArchivo: string = '';

  private generarCodigoEvento(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const longitud = 10;
    let resultado = '';

    for (let i = 0; i < longitud; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return resultado;
  }



  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private loadingController: LoadingController, // Nuevo
    private eventosService: EventosService,
    private navCtrl: NavController
  ) {
    this.registroForm = this.fb.group({
      idCodEvento: [this.generarCodigoEvento()],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      latitud: [''],
      longitud: [''],
      fechaCreacion: [this.fechaActual, Validators.required],
      imagen: [''],
      video: [''],
      comentario: [''],
      popularidad: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      estado: ['Activo', Validators.required],
      fechaVisual: [''],
      comentarioRev: [''],
      tipoContenido: ['', Validators.required],
      idUsuario: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    console.log("prueba");
    console.log(this.usuarioActual._id);
    this.registroForm.patchValue({
      idUsuario: this.usuarioActual._id
    });
  }

  /* Método para mostrar una alerta con un mensaje personalizado. */
  /* Este método se utiliza para mostrar mensajes de éxito o error al usuario. */
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /* Método para tomar una foto utilizando la cámara del dispositivo. */
  /* Este método utiliza el plugin Camera de Capacitor para capturar una imagen. */
  async tomarFoto() {
    try {
      const imagen = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });

      this.imagenPrevia = imagen.dataUrl;
      this.registroForm.patchValue({
        imagen: {
          dataUrl: imagen.dataUrl,
          name: `imagen_${Date.now()}.jpg`, // Asignar nombre único
        },
      });
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.mostrarAlerta('Error', 'No se pudo capturar la imagen');
    }
  }

  /* Método para eliminar la imagen seleccionada. */
  /* Este método muestra una alerta de confirmación antes de eliminar la imagen. */
  async eliminarImagen() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar la imagen seleccionada?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.imagenPrevia = undefined;
            this.registroForm.patchValue({ imagen: '' });
            this.mostrarAlerta('Éxito', 'Imagen eliminada correctamente');
          },
        },
      ],
    });

    await alert.present();
  }

  /* Método para seleccionar un video desde el dispositivo. */
  /* Este método utiliza el plugin FilePicker de Capacitor para seleccionar un video. */
  async seleccionarVideo() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['video/*'],
        // multiple: false,
        readData: true,
      });

      if (result.files && result.files.length > 0) {
        const selectedFile = result.files[0];
        this.nombreArchivo = selectedFile.name;
        this.esVideo = selectedFile.mimeType?.startsWith('video/') || false;

        if (this.esVideo && selectedFile.data) {
          // Convertir los datos base64 a ArrayBuffer
          const byteCharacters = atob(selectedFile.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          // Crear Blob y URL
          const blob = new Blob([byteArray], {
            type: selectedFile.mimeType,
          });
          const videoUrl = URL.createObjectURL(blob);
          this.videoPrevia = this.sanitizer.bypassSecurityTrustUrl(videoUrl);
        }

        // Guardar la información del archivo
        this.registroForm.patchValue({
          video: {
            path: selectedFile.path,
            name: selectedFile.name,
            size: selectedFile.size,
            mimeType: selectedFile.mimeType,
            esVideo: this.esVideo,
            data: selectedFile.data,
          },
        });
      }
    } catch (error) {
      console.error('Error al seleccionar video:', error);
      if ((error as any).message !== 'User canceled.') {
        await this.mostrarAlerta('Error', 'No se pudo seleccionar el video');
      }
    }
  }

  /* Método para eliminar el video seleccionado. */
  /* Este método muestra una alerta de confirmación antes de eliminar el video. */
  async eliminarVideo() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar el video seleccionado?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            if (this.videoPrevia) {
              URL.revokeObjectURL(this.videoPrevia.toString());
            }
            this.videoPrevia = undefined;
            this.esVideo = false;
            this.nombreArchivo = '';
            this.registroForm.patchValue({ video: '' });
            this.mostrarAlerta('Éxito', 'Video eliminado correctamente');
          },
        },
      ],
    });

    await alert.present();
  }

  /* Método para limpiar la imagen previa. */
  ngOnDestroy() {
    // Limpiar las URLs creadas para evitar fugas de memoria
    if (this.videoPrevia) {
      URL.revokeObjectURL(this.videoPrevia.toString());
    }
  }

  async onSubmit() {
    if (this.registroForm.valid) {
      this.cargando = true;

      const formData = new FormData();

      // Obtener todos los valores del formulario
      const formDataValues = this.registroForm.value;

      // Agregar todos los campos normales al FormData
      Object.keys(formDataValues).forEach(key => {
        if (key !== 'imagen' && key !== 'video') {
          const value = formDataValues[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      // Procesar imagen si existe
      if (this.imagenPrevia && this.registroForm.get('imagen')?.value?.dataUrl) {
        const base64Image = this.registroForm.get('imagen')?.value?.dataUrl.split(',')[1];
        const blob = this.base64ToBlob(base64Image, 'image/jpeg');
        formData.append('imagen', blob, `imgEvento_${Date.now()}.jpg`);
      }

      // Procesar video si existe
      const videoData = this.registroForm.get('video')?.value?.data;
      if (videoData) {
        const byteCharacters = atob(videoData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'video/mp4' });
        formData.append('video', blob, `vidEvento_${Date.now()}.mp4`);
      }

      // Enviar al servicio
      try {
        console.log('Enviando evento con archivos...');
        await this.eventosService.crearEvento(formData).toPromise();

        // Primero ocultar el loader
        this.cargando = false;

        // Esperar un ciclo de detección de cambios (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Mostrar alerta y navegar
        await this.mostrarAlerta('Éxito', 'Evento guardado exitosamente');
        this.registroForm.reset();
        this.imagenPrevia = undefined;
        this.videoPrevia = undefined;
        // this.navCtrl.navigateRoot('/tabs-user/tab4');
        this.navCtrl.back(); // Esto regresará a la página anterior en el historial

      } catch (error) {
        console.error('Error al guardar evento:', error);
        this.cargando = false;
        await this.mostrarAlerta('Error', 'No se pudo guardar el evento');
      }
    } else {
      await this.mostrarAlerta('Error', 'Por favor complete todos los campos requeridos');
    }
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  // En tu componente TypeScript
  volver() {
    this.navCtrl.back(); // Esto regresará a la página anterior en el historial
  }

}