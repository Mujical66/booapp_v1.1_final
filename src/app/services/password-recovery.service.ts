// services/password-recovery.service.ts
import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryService {
  private readonly SERVICE_ID = 'service_sb3684d'; // En EmailJS > Email Services
  private readonly TEMPLATE_ID = 'template_3yzrg4b'; // ID de tu plantilla
  private readonly USER_ID = 'NiN61qYuGetz4RrbM'; // En EmailJS > Integration

  constructor() {
    emailjs.init(this.USER_ID); // Inicializa EmailJS
  }

  async sendTempPassword(email: string, tempPassword: string): Promise<boolean> {
    try {
      await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, {
        to_email: email,
        password: tempPassword,
        app_name: 'App Universitaria' // Personaliza
      });
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }
}