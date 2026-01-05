import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

interface Usuario {
  email: string;
  nombre: string;
  tipo: 'CLIENTE' | 'CHOFER' | 'ADMINISTRADOR';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'golfkart_user';

  // Usuarios mock SOLO para desarrollo
  // En producción, esto vendría de una API con autenticación real
  private mockUsers = [
    {
      email: 'ronnypilay@gmail.com',
      nombre: 'Ronny',
      tipo: 'CLIENTE' as const,
      // En desarrollo, usamos un hash simple (en producción sería bcrypt)
      passwordHash: this.simpleHash('ronnypilay'),
    },
    {
      email: 'rickypilay@gmail.com',
      nombre: 'Ricky',
      tipo: 'CHOFER' as const,
      passwordHash: this.simpleHash('rickypilay'),
    },
    {
      email: 'yeronfontabella@gmail.com',
      nombre: 'Yeron',
      tipo: 'ADMINISTRADOR' as const,
      passwordHash: this.simpleHash('yeronfontabella'),
    },
  ];

  constructor() {}

  /**
   * Hash simple SOLO para desarrollo
   * En producción esto se hace en el backend con bcrypt
   */
  private simpleHash(text: string): string {
    // Esta es solo una representación - NO es seguro para producción
    return btoa(text); // Base64 encoding
  }

  /**
   * Login del usuario
   * En producción, esto llamaría a una API: POST /api/auth/login
   */
  async login(email: string, password: string): Promise<Usuario | null> {
    if (environment.useMockData) {
      // Desarrollo: validar contra datos mock
      const user = this.mockUsers.find(
        (u) =>
          u.email === email && u.passwordHash === this.simpleHash(password),
      );

      if (user) {
        const usuario: Usuario = {
          email: user.email,
          nombre: user.nombre,
          tipo: user.tipo,
        };

        // Guardar sesión (sin contraseña)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
        return usuario;
      }
      return null;
    } else {
      // Producción: llamar a la API
      try {
        const response = await fetch(`${environment.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const usuario = await response.json();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
          return usuario;
        }
        return null;
      } catch (error) {
        console.error('Error en login:', error);
        return null;
      }
    }
  }

  /**
   * Obtener usuario actual de la sesión
   */
  getCurrentUser(): Usuario | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verificar si hay sesión activa
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}
