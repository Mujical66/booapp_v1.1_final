import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonGrid,
  IonImg,
  IonTextarea,
  AlertController,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonSpinner,
} from '@ionic/angular/standalone';

import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

import { ApiBooappService } from '../services/api-booapp.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';

import { help, camera, trash, videocam, save, document } from 'ionicons/icons';

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
  | 'revision'
  | 'tipoContenido';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonGrid,
    ReactiveFormsModule,
    IonImg,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonSpinner,
  ],
})
export class EditarPage implements OnInit {
  patchForm!: FormGroup;
  fechaCreacionFormateada: string = '';

  imagenPrevia?: string;
  imagenAlmacenada?: string;
  videoPrevia?: string;
  videoAlmacenado?: string;
  nombreArchivo: string = '';
  esVideo: boolean = false;
  videoKey: number = Date.now();
  originalFormValue: any;
  cargando: boolean = false;

  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private alertController: AlertController,
    private http: HttpClient,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private apiService: ApiBooappService,
    private authService: AuthService
  ) {
    addIcons({ help, camera, trash, videocam, document, save });
  }

  ngOnInit() {
    this.checkAdminRole();
    this.inicializarData();
  }

  checkAdminRole() {
    const usuarioActual = this.authService.getUsuarioActual();
    this.isAdmin = usuarioActual?.rol === 'admin';
  }

  async mostrarAyuda(campo: CamposAyuda) {
    const mensajesAyuda: Record<CamposAyuda, string> = {
      titulo:
        'Ingrese un título descriptivo para el evento. Ejemplo: "La Llorona en el Río"',
      descripcion:
        'Describa detalladamente el mito o leyenda. Incluya características importantes.',
      ubicacion:
        'Indique la ubicación exacta asociada al evento. Ejemplo: "Avenida Lecuna, cerca Teatro Nacional, Caracas"',
      fechaCreacion: 'Solo en carga del evento',
      latitud:
        'Coordenada de latitud (solo admin) en grados decimales, se pueden obtener en https://www.mapcoordinates.net/es',
      longitud:
        'Coordenada de longitud (solo admin) en grados decimales, se pueden obtener en https://www.mapcoordinates.net/es',
      multimedia: 'Suba una imagen (máx 1 MB) y/o un video (máx 3 MB)',
      comentario: 'Comentarios adicionales sobre el evento',
      popularidad: 'Solo en carga del evento',
      revision: 'Comentario emitido por Admin',
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

  inicializarData() {
    this.patchForm = this.fb.group({
      _id: ['', Validators.required],
      idCodEvento: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      ubicacion: ['', Validators.required],
      latitud: [''],
      longitud: [''],
      fechaCreacion: ['', Validators.required],
      imagen: [''],
      video: [''],
      comentario: [''],
      popularidad: [0, [Validators.required, Validators.pattern(/^[0-5]+$/)]],
      estado: ['Activo', Validators.required],
      fechaVisual: [''],
      comentarioRev: [''],
      tipoContenido: ['', Validators.required],
      idUsuario: ['', Validators.required],
    });

    this.route.queryParams.subscribe((params) => {
      this.patchForm.patchValue({
        _id: params['_id'] || '',
        idCodEvento: params['idCodEvento'] || '',
        titulo: params['titulo'] || '',
        descripcion: params['descripcion'] || '',
        ubicacion: params['ubicacion'] || '',
        latitud: params['latitud'] || '',
        longitud: params['longitud'] || '',
        fechaCreacion: params['fechaCreacion'] || new Date().toISOString(),
        imagen: params['imagen'] || '',
        video: params['video'] || '',
        comentario: params['comentario'] || '',
        popularidad: params['popularidad'] || 0,
        estado: params['estado'] || 'Activo',
        fechaVisual: params['fechaVisual'] || '',
        comentarioRev: params['comentarioRev'] || '',
        tipoContenido: params['tipoContenido'] || '',
        idUsuario: params['idUsuario'] || '',
      });

      // Si hay imagen almacenada, arma la URL
      if (params['imagen']) {
        this.imagenAlmacenada =
          'https://s3-uploadimages-booapp-bucket.s3.us-east-2.amazonaws.com/' +
          params['imagen'];
      }

      // Si hay video almacenado, arma la URL
      if (params['video']) {
        this.videoAlmacenado =
          'https://s3-uploadimages-booapp-bucket.s3.us-east-2.amazonaws.com/' +
          params['video'];
      }

      // Formatea la fecha si existe
      if (params['fechaCreacion']) {
        this.fechaCreacionFormateada = this.formatFecha(
          params['fechaCreacion']
        );
        this.patchForm.patchValue({ fechaCreacion: params['fechaCreacion'] });
      }
    });
  }

  // Método para actualizar el evento
  async onUpdate() {
    if (this.patchForm.valid) {
      const titulo = this.patchForm.value.titulo?.trim();
      if (!titulo) {
        const errorAlert = await this.alertController.create({
          header: 'Error',
          message: 'El campo Título no puede estar vacío.',
          buttons: ['OK'],
        });
        await errorAlert.present();
        return;
      }
      const alert = await this.alertController.create({
        header: 'Confirmación',
        message: '¿Seguro de Actualizar los Datos?',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: async () => {
              const loading = await this.loadingController.create({
                message: 'Actualizando...',
                spinner: 'bubbles',
                backdropDismiss: false,
              });
              await loading.present();

              const id = this.patchForm.value._id;
              if (!id || id.length !== 24) {
                await loading.dismiss();
                const errorAlert = await this.alertController.create({
                  header: 'Error',
                  message: 'El identificador del evento no es válido.',
                  buttons: ['OK'],
                });
                await errorAlert.present();
                return;
              }
              const { _id, ...fields } = this.patchForm.value;

              const hasImageFile = fields.imagen instanceof File;
              const hasVideoFile = fields.video instanceof File;

              let body: any;
              let options: any = {};

              if (hasImageFile || hasVideoFile) {
                console.log('Archivo video:', fields.video);
                body = new FormData();
                for (const key in fields) {
                  if (
                    fields[key] !== undefined &&
                    fields[key] !== null &&
                    fields[key] !== ''
                  ) {
                    body.append(key, fields[key]);
                  }
                }
              } else {
                body = fields;
                options = { headers: { 'Content-Type': 'application/json' } };
              }

              this.apiService.actualizarEvento(id, body, options).subscribe({
                next: async (response: any) => {
                  await loading.dismiss();
                  console.log('Respuesta del PATCH:', response);

                  // Actualiza el formulario con los datos del servidor
                  const evento = response.data.Eventos;
                  console.log('Evento actualizado:', evento);
                  this.patchForm.patchValue(evento);
                  console.log('Formulario actualizado:', this.patchForm.value);

                  // Actualiza las propiedades de la vista
                  this.imagenAlmacenada = evento.imagen
                    ? `https://s3-uploadimages-booapp-bucket.s3.us-east-2.amazonaws.com/${evento.imagen}`
                    : undefined;
                  this.videoAlmacenado = evento.video
                    ? `https://s3-uploadimages-booapp-bucket.s3.us-east-2.amazonaws.com/${evento.video}`
                    : undefined;
                  this.fechaCreacionFormateada = this.formatFecha(
                    evento.fechaCreacion
                  );

                  // Forzar detección de cambios para actualizar la vista
                  this.cdr.detectChanges();

                  // Notificar al servicio para recargar los eventos
                  this.apiService.cargarEventos();

                  // Mostrar el alerta y esperar a que el usuario lo cierre
                  const successAlert = await this.alertController.create({
                    header: 'Éxito',
                    message: 'El evento fue actualizado correctamente.',
                    cssClass: 'custom-alert',
                    buttons: [
                      {
                        text: 'OK',
                        handler: () => {
                          // Navegar solo después de que el usuario haga clic en OK
                          this.navCtrl.navigateRoot('tabs-user/tab4');
                        },
                      },
                    ],
                  });
                  await successAlert.present();
                },
                error: async (error) => {
                  await loading.dismiss();
                  console.error('Error en PATCH:', error);
                  const errorAlert = await this.alertController.create({
                    header: 'Error',
                    message:
                      error.error?.message ||
                      'Ocurrió un error al actualizar el evento. Intenta nuevamente.',
                    buttons: ['OK'],
                  });
                  await errorAlert.present();
                },
              });
            },
          },
        ],
      });
      await alert.present();
    }
  }

  private formatFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // Método cancelar para volver a la página anterior:
  cancelar() {
    this.location.back();
  }

  // Agrega aquí los métodos recomendados
  tomarFoto() {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.nombreArchivo = file.name;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenPrevia = e.target.result;
          this.patchForm.patchValue({ imagen: file });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // Método para eliminar la imagen
  eliminarImagen() {
    this.imagenPrevia = undefined;
    this.patchForm.patchValue({ imagen: '' });
    this.nombreArchivo = '';
  }

  // Método para seleccionar el video
  seleccionarVideo() {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,application/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Libera la URL anterior si existe
        if (this.videoPrevia) {
          URL.revokeObjectURL(this.videoPrevia);
        }
        this.nombreArchivo = file.name;
        this.esVideo = file.type.startsWith('video/');
        this.videoAlmacenado = undefined; // Oculta el video almacenado
        this.videoPrevia = URL.createObjectURL(file);
        this.videoKey = Date.now(); // <-- NUEVO: clave única para forzar recarga
        this.patchForm.patchValue({ video: file });
      }
    };
    input.click();
  }

  // Método para eliminar el video
  eliminarVideo() {
    if (this.videoPrevia) {
      URL.revokeObjectURL(this.videoPrevia);
    }
    this.videoPrevia = undefined;
    this.esVideo = false;
    this.nombreArchivo = '';
    this.patchForm.patchValue({ video: '' });
  }

  // Método para actualizar la vista previa del video
  actualizarVistaPreviaVideo() {
    this.videoKey = Date.now(); // Cambia la clave para forzar recarga del <video>
  }
}
