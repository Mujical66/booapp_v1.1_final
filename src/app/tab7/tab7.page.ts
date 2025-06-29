import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router'; // Añade este import
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem, // Añade esto
  IonButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common'; // Añade esto

@Component({
  selector: 'app-tab7',
  templateUrl: 'tab7.page.html',
  styleUrls: ['tab7.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // Añade esto
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem, // Añade esto
    IonButton,
    IonGrid,
    IonRow,
    IonCol
  ]
})

export class Tab7Page implements OnInit {
  usuarios: any[] = [];
  usuarioActual: any;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router // Inyecta el Router
  ) { }

  async ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    await this.cargarUsuarios();
  }

  async confirmarEliminarCuenta() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.eliminarCuenta()
        }
      ]
    });

    await alert.present();
  }

  async eliminarCuenta() {
    const loading = await this.loadingController.create({
      message: 'Eliminando cuenta...'
    });
    await loading.present();

    try {
      // Llama al método del servicio para eliminar la cuenta
      await this.authService.eliminarUsuario(this.usuarioActual._id).toPromise();
      
      // Cierra sesión y redirige
      this.authService.cerrarSesion();
      this.router.navigate(['/tabs']);
      
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  async cargarUsuarios() {
    console.log('Iniciando carga de usuarios...'); // Debug

    const loading = await this.loadingController.create({
      message: 'Cargando usuarios...'
    });

    try {
      await loading.present();
      console.log('Loading presentado'); // Debug

      this.authService.cargarUsuarios().subscribe({
        next: (usuarios) => {
          console.log('Usuarios recibidos:', usuarios); // Debug
          this.usuarios = usuarios;
          loading.dismiss();
        },
        error: async (err) => {
          console.error('Error al cargar usuarios:', err); // Debug
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No se pudieron cargar los usuarios: ' + err.message,
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } catch (error) {
      console.error('Error en cargarUsuarios:', error); // Debug
      await loading.dismiss();
    }
  }

  async cambiarRol(usuario: any) {
    // No permitir modificar al usuario actual
    if (usuario._id === this.usuarioActual?._id) {
      const alert = await this.alertController.create({
        header: 'Acción no permitida',
        message: 'No puedes modificar tu propio rol',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const nuevoRol = usuario.rol === 'admin' ? 'Turista' : 'admin';
    const loading = await this.loadingController.create({
      message: 'Actualizando rol...'
    });
    await loading.present();

    this.authService.actualizarRolUsuario(usuario._id, nuevoRol).subscribe({
      next: async () => {
        await loading.dismiss();
        usuario.rol = nuevoRol;
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: `Rol cambiado a ${nuevoRol}`,
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async (err) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo cambiar el rol',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}