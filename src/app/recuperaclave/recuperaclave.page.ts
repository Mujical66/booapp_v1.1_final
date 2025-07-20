import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  IonText
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com'; // Importa EmailJS

@Component({
  selector: 'app-recuperaclave',
  templateUrl: 'recuperaclave.page.html',
  styleUrls: ['recuperaclave.page.scss'],
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
    IonText
  ]
})
export class RecuperaClavePage {
  credenciales = {
    email: ''
  };
  loading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  usuarioEncontrado: any = null;

  // Configuración de EmailJS (reemplaza con tus datos)
  private readonly EMAILJS_CONFIG = {
    SERVICE_ID: 'service_sb3684d', // En EmailJS > Email Services
    TEMPLATE_ID: 'template_3yzrg4b', // ID de tu plantilla
    USER_ID: 'NiN61qYuGetz4RrbM' // En EmailJS > Integration
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    emailjs.init(this.EMAILJS_CONFIG.USER_ID); // Inicializa EmailJS
  }

  async enviarcorreo() {
    const email = this.credenciales.email.trim();

    if (!email) {
      this.mostrarError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    this.loading = true;

    try {
      const usuarios = await this.authService.cargarUsuarios().toPromise();
      const usuario = usuarios?.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (usuario) {
        this.usuarioEncontrado = usuario;
        
        // Envía el correo con EmailJS
        await this.enviarCorreoRecuperacion(usuario.email, usuario.password);
        
        this.mostrarExito();
      } else {
        this.mostrarError('No se encontró ningún usuario con ese correo.');
      }
    } catch (err) {
      console.error('Error:', err);
      this.mostrarError('Hubo un problema al verificar el correo. Inténtalo más tarde.');
    } finally {
      this.loading = false;
    }
  }

  private async enviarCorreoRecuperacion(email: string, password: string): Promise<void> {
    try {
      await emailjs.send(
        this.EMAILJS_CONFIG.SERVICE_ID,
        this.EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: email,
          password: password,
          app_name: 'Tu App', // Personaliza esto
          title: email,
          message: 'Tu contraseña de acceso a BooApp es: ' + password
        }
      );
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new Error('Falló el envío del correo');
    }
  }

  private mostrarExito(): void {
    this.toastMessage = 'Correo enviado exitosamente. Revisa tu bandeja.';
    this.showToast = true;

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 3000);
  }

  private mostrarError(mensaje: string): void {
    this.toastMessage = mensaje;
    this.showToast = true;
  }

  async retornar() {
    this.router.navigate(['/home']);
  }
}