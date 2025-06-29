// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface Usuario {
  _id?: string;
  IdDni: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  fotoPerfil: string;
  activo: boolean | number;
  fechaIngreso: string;
  ultimaActividad: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    colusuario?: Usuario[];
    Usuarios?: Usuario[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://booapp-api.onrender.com/v1/backend-api-booapp-aws/colusuario';
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage(); // Añade esta línea
  }

  // Métodos nuevos para persistencia:
  setUsuarioActual(usuario: Usuario): void {
    this.usuarioActual = usuario;
    localStorage.setItem('usuarioActual', JSON.stringify(usuario)); // Guarda en localStorage
  }

  cargarUsuarioDesdeStorage(): void {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
  }

  eliminarUsuario(userId: string): Observable<any> {
    if (!userId) {
      return throwError(() => new Error('ID de usuario requerido'));
    }

    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar usuario:', error);
        return throwError(() => new Error('Error al eliminar el usuario'));
      })
    );
  }



  /**
   * Carga todos los usuarios desde la API
   * @returns Observable con array de usuarios
   */
  cargarUsuarios(): Observable<Usuario[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map((response: ApiResponse) => {
        if (!response.success) {
          throw new Error(response.message || 'Error al cargar usuarios');
        }

        // Maneja ambas posibles propiedades de respuesta
        const usuarios = response.data?.Usuarios || response.data?.colusuario;
        if (!usuarios) {
          throw new Error('Formato de respuesta inesperado');
        }

        return usuarios;
      }),
      catchError(error => {
        console.error('Error en cargarUsuarios:', error);
        return throwError(() => new Error('No se pudieron cargar los usuarios. Intente nuevamente.'));
      })
    );
  }

  // Añade este método en tu AuthService (auth.service.ts)
  actualizarRolUsuario(userId: string, nuevoRol: string): Observable<any> {
    if (!userId) {
      return throwError(() => new Error('ID de usuario requerido'));
    }

    return this.http.patch(`${this.apiUrl}/${userId}`, { rol: nuevoRol }).pipe(
      catchError(error => {
        console.error('Error al actualizar rol:', error);
        return throwError(() => new Error('Error al actualizar rol del usuario'));
      })
    );
  }

  /**
   * Realiza el login verificando credenciales
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con objeto {success: boolean, usuario?: Usuario}
   */
  login(email: string, password: string): Observable<{ success: boolean, usuario?: Usuario }> {
    if (!email || !password) {
      return throwError(() => new Error('Email y contraseña son requeridos'));
    }

    return this.cargarUsuarios().pipe(
      map((usuarios: Usuario[]) => {
        const usuario = usuarios.find((u: Usuario) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
        );

        if (!usuario) {
          return { success: false };
        }

        this.usuarioActual = usuario;
        return { success: true, usuario };
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error('Error al iniciar sesión. Verifique sus credenciales.'));
      })
    );
  }

  /**
   * Registra un nuevo usuario
   * @param usuarioData Datos del usuario a registrar
   * @param fotoPerfil Foto de perfil en formato Data URI (opcional)
   * @returns Observable con la respuesta del servidor
   */
  registrarUsuario(usuarioData: Partial<Usuario>, fotoPerfil?: string): Observable<any> {
    // Validación básica
    if (!usuarioData.email || !usuarioData.password) {
      return throwError(() => new Error('Email y contraseña son requeridos'));
    }

    const formData = new FormData();
    // Campos obligatorios
    formData.append('email', usuarioData.email);
    formData.append('password', usuarioData.password);
    formData.append('nombre', usuarioData.nombre || '');
    formData.append('rol', usuarioData.rol || 'Turista');

    // Campos opcionales
    if (usuarioData.IdDni) formData.append('IdDni', usuarioData.IdDni);
    formData.append('activo', String(usuarioData.activo ?? 1));
    formData.append('fechaIngreso', usuarioData.fechaIngreso || new Date().toISOString());
    formData.append('ultimaActividad', usuarioData.ultimaActividad || new Date().toISOString());

    if (fotoPerfil) {
      try {
        const blob = this.dataURItoBlob(fotoPerfil);
        formData.append('fotoPerfil', blob, 'perfil.jpg');
      } catch (error) {
        console.error('Error al procesar imagen:', error);
        // No interrumpimos el registro por error en imagen
      }
    }

    return this.http.post(this.apiUrl, formData).pipe(
      tap(response => console.log('Registro exitoso:', response)),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => new Error('Error al registrar usuario. Intente nuevamente.'));
      })
    );
  }

  /**
   * Obtiene el usuario actualmente autenticado
   * @returns Usuario o null si no hay sesión activa
   */
  getUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns boolean indicando si hay sesión activa
   */
  estaAutenticado(): boolean {
    return !!this.usuarioActual;
  }

  /**
   * Cierra la sesión actual
   */
  // Asegúrate de que cerrarSesion() limpie el localStorage:
  cerrarSesion(): void {
    this.usuarioActual = null;
    localStorage.removeItem('usuarioActual'); // Añade esta línea
  }

  /**
   * Convierte Data URI a Blob
   * @param dataURI String en formato data URI
   * @returns Blob con la imagen
   * @throws Error si el formato es inválido
   */
  private dataURItoBlob(dataURI: string): Blob {
    try {
      const splitDataURI = dataURI.split(',');
      if (splitDataURI.length < 2) {
        throw new Error('Formato DataURI inválido');
      }

      const byteString = atob(splitDataURI[1]);
      const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mimeString });
    } catch (error) {
      console.error('Error en dataURItoBlob:', error);
      throw new Error('No se pudo procesar la imagen');
    }
  }
}