import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
//aqui empieza la clase que se exporta
export class Login {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const emailInput = (
      document.getElementById('formEmail') as HTMLInputElement
    ).value
      .trim()
      .toLowerCase();
    const passwordInput = (
      document.getElementById('formPassword') as HTMLInputElement
    ).value.trim();

    // Usar el servicio de autenticación (sin almacenar contraseñas)
    const usuario = await this.authService.login(emailInput, passwordInput);

    if (!usuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo o contraseña incorrectos',
      });
      return;
    }

    // Redirigir según el tipo de usuario
    switch (usuario.tipo.toUpperCase()) {
      case 'CLIENTE':
        this.router.navigate(['/usuario']);
        break;
      case 'CHOFER':
        this.router.navigate(['/chofer']);
        break;
      case 'ADMINISTRADOR':
        this.router.navigate(['/admin']);
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tipo de usuario desconocido',
        });
    }
  }

  irCrearUsuario(): void {
    this.router.navigate(['/crear-cuenta']);
  }
}
