import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Usuario {
  email: string;
  password: string;
  tipo: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  usuarios: Usuario[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    fetch('usuarios.json')
      .then(response => response.json())
      .then(data => {
        const usuariosLocal = JSON.parse(localStorage.getItem('usuarios') || '[]');
        this.usuarios = data.concat(usuariosLocal);
      })
      .catch(error => {
        console.error('Error cargando usuarios:', error);
        this.usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      });
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const emailInput = (document.getElementById('formEmail') as HTMLInputElement).value.trim().toLowerCase();
    const passwordInput = (document.getElementById('formPassword') as HTMLInputElement).value.trim();

    const usuario = this.usuarios.find(u =>
      u.email === emailInput && u.password === passwordInput
    );

    if (!usuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Correo o contraseña incorrectos'
      });
      return;
    }

    sessionStorage.setItem('usuarioActivo', JSON.stringify(usuario));

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
        alert('Tipo de usuario desconocido.');
    }
  }
  
  irCrearUsuario() {
    this.router.navigate(['/crear-cuenta']);
  }
}
