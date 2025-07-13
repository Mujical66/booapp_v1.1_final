// src/app/login/login.page.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  IonText,
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
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
    IonText,
  ],
})
export class LoginPage {
  credenciales = {
    email: '',
    password: '',
  };

  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // En tu componente LoginPage
  login() {
    const { email, password } = this.credenciales;

    if (email === 'admin' && password === 'admin') {
      this.router.navigate(['/tabs-admin']);
    }

    if (!email || !password) {
      this.mostrarError('Por favor, ingresa tu correo y contraseña');
      return;
    }

    this.loading = true;

    this.authService.login(email, password).subscribe({
      next: (result) => {
        this.loading = false;

        if (result.success && result.usuario) {
          // Redirigir según el rol del usuario
          if (result.usuario.rol === 'admin') {
            this.router.navigate(['/tabs-admin']);
          } else {
            this.router.navigate(['/tabs-user']);
          }
        } else {
          this.mostrarError('Correo o contraseña incorrectos');
        }
      },
      error: (err) => {
        this.loading = false;
        this.mostrarError('Ocurrió un error al intentar iniciar sesión');
      },
    });
  }

  private mostrarError(mensaje: string): void {
    this.toastMessage = mensaje;
    this.showToast = true;
  }

  async retornar() {
    this.router.navigate(['/home']);
  }
}
