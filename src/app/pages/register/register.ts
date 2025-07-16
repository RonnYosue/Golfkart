import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  nombre: string;
  apellido: string;
  tipo: string;
  email: string;
  password: string;
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class Register{

  nombre: string = '';
  apellido: string = '';
  tipo: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordError: string = '';

  onSubmit(event: Event): void {
    event.preventDefault();

    // Validaciones básicas
    if (!this.nombre || !this.apellido || !this.email || !this.password || !this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.'
      });
      return;
    }

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!soloLetras.test(this.nombre)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre solo debe contener letras.'
      });
      return;
    }

    if (!soloLetras.test(this.apellido)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El apellido solo debe contener letras.'
      });
      return;
    }

    if (!correoValido.test(this.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo electrónico no válido.'
      });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    } else {
      this.passwordError = '';
    }

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const existe = usuarios.some(user => user.email === this.email.toLowerCase());

    if (existe) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo ya existe.'
      });
      return;
    }

    const nuevoUsuario: Usuario = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      tipo: this.tipo.trim().toUpperCase(),
      email: this.email.trim().toLowerCase(),
      password: this.password // ⚠️ Recuerda: en producción, se deben encriptar las contraseñas
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Ahora puedes iniciar sesión.'
    });

    // Limpiar campos
    this.nombre = '';
    this.apellido = '';
    this.tipo = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
