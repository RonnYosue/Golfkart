import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cuenta.html',
  styleUrls: ['./crear-cuenta.css']
})
export class CrearCuenta {

  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  tipo: string = 'CLIENTE'; // Por defecto

  passwordError: string = '';

  onSubmit(event: Event): void {
    event.preventDefault();

    // Validaciones
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.nombre)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre solo debe contener letras.'
      });
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.apellido)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El apellido solo debe contener letras.'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo electrónico no válido.'
      });
      return;
    }

    if (!this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La contraseña no puede estar vacía.'
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    } else {
      this.passwordError = '';
    }

    // Leer usuarios del localStorage
    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');

    const yaExiste = usuarios.some(u => u.email === this.email);
    if (yaExiste) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo ya existe.'
      });
      return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      password: this.password,
      tipo: this.tipo
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Ahora puedes iniciar sesión.',
      confirmButtonText: 'Ir al login'
    }).then(() => {
      window.location.href = 'login';
    });
  }
}
