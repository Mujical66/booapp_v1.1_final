import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonInput,
  IonicModule,
  AlertController,
  LoadingController,
  Platform,
} from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Filesystem } from '@capacitor/filesystem';
import { AuthService } from '../services/auth.service';
import { EventosService } from '../services/eventos.service';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { help, camera, trash, videocam, save } from 'ionicons/icons';

type CamposAyuda =
  | 'titulo'
  | 'descripcion'
  | 'ubicacion'
  | 'latitud'
  | 'longitud'
  | 'fechaCreacion'
  | 'multimedia'
  | 'comentario'
  | 'popularidad'
  | 'estado'
  | 'tipoContenido';

@Component({
  selector: 'app-detalle-evento',
  templateUrl: 'nuevo-evento.page.html',
  styleUrls: ['nuevo-evento.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class NuevoEventoPage implements OnDestroy {
  usuarioActual: any;
  cargando = false;
  registroForm: FormGroup;
  fechaActual: string = new Date().toISOString();
  imagenPrevia: string | undefined;
  videoPrevia: SafeUrl | undefined;
  esVideo: boolean = false;
  nombreArchivo: string = '';
  isAdmin: boolean = false;
  private backbuttonSubscription: any;

  private generarCodigoEvento(): string {
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const longitud = 10;
    let resultado = '';

    for (let i = 0; i < longitud; i++) {
      resultado += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return resultado;
  }

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
    private loadingController: LoadingController,
    private eventosService: EventosService,
    private navCtrl: NavController,
    private platform: Platform
  ) {
    addIcons({ help, camera, trash, videocam, save });
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
    console.log('Inicializando NuevoEventoPage');
    try {
      this.usuarioActual = this.authService.getUsuarioActual();
      if (!this.usuarioActual?._id) {
        console.error('Usuario actual no definido');
        await this.mostrarAlerta(
          'Error',
          'No se pudo cargar el usuario actual'
        );
        this.navCtrl.navigateRoot('/login');
        return;
      }
      this.registroForm.patchValue({
        idUsuario: this.usuarioActual._id,
        estado: 'Inactivo',
      });

      this.isAdmin = this.usuarioActual?.rol === 'admin';

      if (!this.isAdmin) {
        this.registroForm.patchValue({
          latitud: '0',
          longitud: '0',
        });
      }

      this.backbuttonSubscription =
        this.platform.backButton.subscribeWithPriority(10, () => {
          console.log('Evento de retroceso disparado');
          this.navCtrl.back();
        });
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      await this.mostrarAlerta('Error', 'Error al inicializar la página');
    }
  }

  ngOnDestroy() {
    if (this.videoPrevia) {
      URL.revokeObjectURL(this.videoPrevia.toString());
    }
    if (this.backbuttonSubscription) {
      this.backbuttonSubscription.unsubscribe();
    }
  }

  async mostrarAyuda(campo: CamposAyuda) {
    const mensajesAyuda: Record<CamposAyuda, string> = {
      titulo:
        'Ingrese un título descriptivo para el evento. Ejemplo: "La Llorona en el Río"',
      descripcion:
        'Describa detalladamente el mito o leyenda. Incluya características importantes.',
      ubicacion:
        'Indique la ubicación exacta asociada al evento. Ejemplo: "Avenida Lecuna, cerca Teatro Nacional, Caracas"',
      fechaCreacion: 'Seleccione la fecha de creación del evento',
      latitud: 'Coordenada geográfica latitud (solo admin)',
      longitud: 'Coordenada geográfica longitud (solo admin)',
      multimedia: 'Suba una imagen (máx 1 MB) y/o un video (máx 3 MB)',
      comentario: 'Comentarios adicionales sobre el evento',
      popularidad: 'Nivel de popularidad (0-5) donde 5 es muy interesante',
      estado: 'Estado actual del evento (Activo/Inactivo)',
      tipoContenido:
        'Seleccione si es un Mito, Leyenda u Otro tipo de contenido',
    };

    const alert = await this.alertController.create({
      header: 'Ayuda',
      message: mensajesAyuda[campo],
      buttons: ['Entendido'],
      cssClass: 'custom-alert',
    });

    await alert.present();
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      cssClass: 'custom-alert',
      buttons: ['OK'],
    });
    await alert.present();
  }

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
          name: `imagen_${Date.now()}.jpg`,
        },
      });
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      await this.mostrarAlerta('Error', 'No se pudo capturar la imagen');
    }
  }

  async eliminarImagen() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar la imagen seleccionada?',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
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

  async seleccionarVideo() {
    try {
      const result = await FilePicker.pickFiles({
        types: ['video/*'],
        readData: true,
      });

      if (result.files && result.files.length > 0) {
        const selectedFile = result.files[0];
        this.nombreArchivo = selectedFile.name;
        this.esVideo = selectedFile.mimeType?.startsWith('video/') || false;

        if (this.esVideo && selectedFile.data) {
          const byteCharacters = atob(selectedFile.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: selectedFile.mimeType });
          const videoUrl = URL.createObjectURL(blob);
          this.videoPrevia = this.sanitizer.bypassSecurityTrustUrl(videoUrl);
        }

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

  async eliminarVideo() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar el video seleccionado?',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
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

  async onSubmit() {
    if (this.registroForm.valid) {
      this.cargando = true;
      const formData = new FormData();
      const formDataValues = this.registroForm.value;

      Object.keys(formDataValues).forEach((key) => {
        if (key !== 'imagen' && key !== 'video') {
          const value = formDataValues[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        }
      });

      if (
        this.imagenPrevia &&
        this.registroForm.get('imagen')?.value?.dataUrl
      ) {
        const base64Image = this.registroForm
          .get('imagen')
          ?.value?.dataUrl.split(',')[1];
        const blob = this.base64ToBlob(base64Image, 'image/jpeg');
        formData.append('imagen', blob, `imgEvento_${Date.now()}.jpg`);
      }

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

      try {
        console.log('Enviando evento con archivos...');
        await this.eventosService.crearEvento(formData).toPromise();
        this.cargando = false;
        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.mostrarAlerta('Éxito', 'Evento guardado exitosamente');
        this.registroForm.reset();
        this.imagenPrevia = undefined;
        this.videoPrevia = undefined;
        this.navCtrl.back();
      } catch (error) {
        console.error('Error al guardar evento:', error);
        this.cargando = false;
        await this.mostrarAlerta('Error', 'No se pudo guardar el evento');
      }
    } else {
      await this.mostrarAlerta(
        'Error',
        'Por favor complete todos los campos requeridos'
      );
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

  volver() {
    this.navCtrl.back();
  }

  fechaCambiada(event: any) {
    console.log('Fecha cambiada:', event.detail.value);
    this.registroForm.patchValue({
      fechaCreacion: event.detail.value,
    });
  }
}
