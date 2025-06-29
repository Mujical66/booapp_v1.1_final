import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardContent, IonButton, IonInput, IonItem, IonLabel, IonAvatar, IonList, IonToast
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardContent, IonButton, IonInput, IonItem, IonLabel, IonAvatar, IonList, IonToast
  ]
})
export class Tab5Page implements OnInit {
  usuarioActual: any;
  editando: boolean = false;
  formPerfil!: FormGroup;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colusuario';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authService.getUsuarioActual();
    this.initForm();
  }

  initForm() {
    this.formPerfil = this.fb.group({
      IdDni: [this.usuarioActual?.IdDni || '', Validators.required],
      nombre: [this.usuarioActual?.nombre || '', Validators.required],
      password: ['']
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
      password: ''
    });
  }

  guardarCambios() {
    if (this.formPerfil.invalid) return;

    const cambios = {
      IdDni: this.formPerfil.value.IdDni,
      nombre: this.formPerfil.value.nombre,
      ...(this.formPerfil.value.password && { password: this.formPerfil.value.password })
    };

    this.http.patch(`${this.apiUrl}/${this.usuarioActual._id}`, cambios).subscribe({
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
      }
    });
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => this.eliminarCuenta()
        }
      ]
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
      }
    });
  }

  private mostrarMensaje(mensaje: string, color: string = 'danger') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}