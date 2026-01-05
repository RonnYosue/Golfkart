import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare let google: any;
declare let Swal: any;

@Component({
  selector: 'app-usuario-chofer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chofer.html',
  styleUrls: ['./chofer.css'],
})
export class Chofer implements OnInit {
  constructor(private router: Router) {}
  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;

  saludo: string = '';
  sidebarCollapsed = false;

  modalEditarPerfilVisible = false;

  perfilForm = {
    nombre: '',
    email: '',
    password: '',
    tipo: '',
  };

  modalIniciarServicioVisible = false;
  modalRealizarMantenimientoVisible = false;
  modalReservasVisible = false;

  enServicio = false;
  carritoEnServicio: string | null = null;

  carritoIdInput: string = '';
  carritoIdMantenimiento: string = '';
  tipoMantenimiento: string = '';

  reservas: any[] = [];

  map: any;

  ngOnInit(): void {
    this.setSaludo();
    this.loadGoogleMapsScript().then(() => {
      this.initMap();
    });
  }

  setSaludo() {
    const user = JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}');
    if (user && user.nombre && user.tipo) {
      this.saludo = `HOLA ${user.nombre.toUpperCase()}, ${user.tipo.toUpperCase()}`;
    } else {
      this.saludo = '';
    }
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyDR4QKiMi3MyISYIVYCphBN-vZgxGFUUQI';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  initMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: -0.9527943857230249, lng: -80.74554766436874 },
      zoom: 17,
      minZoom: 17,
      maxZoom: 25,
    });
    this.cargarCarritos();
  }

  cargarCarritos() {
    const carritos = JSON.parse(localStorage.getItem('carritos') || '[]');
    carritos.forEach((carrito: any) => {
      new google.maps.Marker({
        position: { lat: carrito.lat, lng: carrito.lng },
        map: this.map,
        title: `Carrito ${carrito.id}`,
        icon: {
          url: 'assets/image/car.png',
          scaledSize: new google.maps.Size(50, 50),
        },
      });
    });
  }

  // Estado de servicio
  iniciarServicio() {
    this.modalIniciarServicioVisible = true;
  }

  confirmarinicioServicio() {
    const inputId = this.carritoIdInput.trim();
    const carritos = JSON.parse(localStorage.getItem('carritos') || '[]');

    // Validar si hay carritos en el sistema
    if (!carritos || carritos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin carritos',
        text: 'Aún no se ha puesto en servicio ningún carrito.',
      });
      return;
    }

    const carrito = carritos.find((c: any) => c.id === inputId);

    if (!inputId) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, ingresa un ID de carrito.',
      });
      return;
    }

    if (!carrito) {
      Swal.fire({
        icon: 'error',
        title: 'Carrito no encontrado',
        text: 'Por favor, ingresa un ID de carrito válido.',
      });
      return;
    }

    this.enServicio = true;
    this.carritoEnServicio = carrito.id;
    this.cerrarModal('modalIniciarServicio');

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: `¡Ahora estás en servicio con el carrito ${carrito.id}!`,
    });

    this.carritoIdInput = '';
  }

  finalizarServicio() {
    if (!this.enServicio) {
      // Mostrar SweetAlert si no está en servicio
      Swal.fire({
        icon: 'warning',
        title: 'No estás en servicio',
        text: 'No puedes finalizar el servicio porque no estás en servicio actualmente.',
      });
      return;
    }

    // Si sí está en servicio, finalizar normalmente
    this.enServicio = false;
    this.carritoEnServicio = null;
    this.mostrarAlertaBootstrap(
      'Servicio finalizado correctamente.',
      'success',
    );
  }

  realizarMantenimiento() {
    this.modalRealizarMantenimientoVisible = true;
  }

  confirmarRealizarMantenimiento() {
    const carritoId = this.carritoIdMantenimiento.trim();
    const tipoMantenimiento = this.tipoMantenimiento.trim();

    if (!carritoId || !tipoMantenimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }

    // --- NUEVO: Guardar mantenimiento en localStorage ---
    const mantenimientos = JSON.parse(
      localStorage.getItem('mantenimientos') || '[]',
    );
    const nuevoMantenimiento = {
      carritoId,
      tipoMantenimiento,
      fecha: new Date().toLocaleString(),
      chofer:
        JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}').nombre ||
        'Desconocido',
    };
    mantenimientos.push(nuevoMantenimiento);
    localStorage.setItem('mantenimientos', JSON.stringify(mantenimientos));
    // ----------------------------------------------------

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: `Mantenimiento registrado para el carrito ${carritoId}.`,
    });

    this.cerrarModal('modalRealizarMantenimiento');
    this.carritoIdMantenimiento = '';
    this.tipoMantenimiento = '';
  }

  mostrarModal(id: string) {
    if (id === 'modalIniciarServicio') {
      this.modalIniciarServicioVisible = true;
    } else if (id === 'modalRealizarMantenimiento') {
      this.modalRealizarMantenimientoVisible = true;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = true;
      this.mostrarReservas();
    } else if (id === 'modalEditarPerfil') {
      this.modalEditarPerfilVisible = true;
      this.cargarDatosPerfil();
    }
  }

  cerrarModal(id: string) {
    if (id === 'modalIniciarServicio') {
      this.modalIniciarServicioVisible = false;
    } else if (id === 'modalRealizarMantenimiento') {
      this.modalRealizarMantenimientoVisible = false;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = false;
    } else if (id === 'modalEditarPerfil') {
      this.modalEditarPerfilVisible = false;
    }
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // ---------------------- RESERVAS ----------------------
  realizarReserva() {
    this.mostrarModal('modalReservas');
    this.mostrarReservas();
  }

  mostrarReservas() {
    this.reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  }

  confirmarReservaChofer(reservaId: string) {
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const idx = reservas.findIndex((r: any) => r.id === reservaId);
    if (idx !== -1) {
      reservas[idx].estado = 'confirmada';
      localStorage.setItem('reservas', JSON.stringify(reservas));
      this.mostrarReservas();
      this.mostrarAlertaBootstrap(
        'Reserva confirmada. El cliente verá el movimiento del carrito.',
        'success',
      );
    }
  }

  mostrarAlertaBootstrap(
    mensaje: string,
    tipo: string = 'success',
    tiempo: number = 3000,
  ) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    const alerta = wrapper.firstElementChild as HTMLElement;
    alertContainer.appendChild(alerta);

    setTimeout(() => {
      alerta.classList.remove('show');
      alerta.classList.add('hide');
      setTimeout(() => alerta.remove(), 500);
    }, tiempo);
  }
  //funciones para editar el perfil

  cargarDatosPerfil() {
    const user = JSON.parse(sessionStorage.getItem('usuarioActivo') || '{}');
    if (user) {
      this.perfilForm = {
        nombre: user.nombre || '',
        email: user.email || '',
        password: user.password || '',
        tipo: user.tipo || '',
      };
    }
  }

  guardarPerfil() {
    const { nombre, email, password, tipo } = this.perfilForm;

    // Validaciones
    if (!nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, ingresa tu nombre.',
      });
      return;
    }

    if (!email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, ingresa tu email.',
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, ingresa tu contraseña.',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Por favor, ingresa un email válido.',
      });
      return;
    }

    // Obtener usuarios del localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioActivo = JSON.parse(
      sessionStorage.getItem('usuarioActivo') || '{}',
    );

    // Verificar si el email ya existe (excepto el usuario actual)
    const emailExiste = usuarios.find(
      (u: any) => u.email === email && u.email !== usuarioActivo.email,
    );
    if (emailExiste) {
      Swal.fire({
        icon: 'error',
        title: 'Email ya existe',
        text: 'Ya existe un usuario con ese email.',
      });
      return;
    }

    // Actualizar usuario en el array de usuarios
    const indiceUsuario = usuarios.findIndex(
      (u: any) => u.email === usuarioActivo.email,
    );
    if (indiceUsuario !== -1) {
      usuarios[indiceUsuario] = {
        ...usuarios[indiceUsuario],
        nombre: nombre.trim(),
        email: email.trim(),
        password: password.trim(),
      };

      // Guardar en localStorage
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Actualizar sessionStorage
      const usuarioActualizado = {
        ...usuarioActivo,
        nombre: nombre.trim(),
        email: email.trim(),
        password: password.trim(),
      };
      sessionStorage.setItem(
        'usuarioActivo',
        JSON.stringify(usuarioActualizado),
      );

      // Actualizar saludo
      this.setSaludo();

      // Cerrar modal y mostrar éxito
      this.cerrarModal('modalEditarPerfil');

      Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos han sido actualizados correctamente.',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil.',
      });
    }
  }
}
