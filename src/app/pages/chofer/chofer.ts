import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare var google: any;
declare var Swal: any;

@Component({
  selector: 'app-usuario-chofer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chofer.html',
  styleUrls: ['./chofer.css']
})
export class  Chofer implements OnInit {
  constructor(private router: Router) {}
  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;

  saludo: string = '';
  sidebarCollapsed = false;

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
    const user = JSON.parse(sessionStorage.getItem("usuarioActivo") || '{}');
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
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAxCvGD2hy58PYPqccAFlGCMiI7YOX0_rQ';
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
      maxZoom: 25
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
          url: "assets/image/car.png",
          scaledSize: new google.maps.Size(50, 50)
        }
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
    const carrito = carritos.find((c: any) => c.id === inputId);

    if (!inputId) {
      this.mostrarAlertaBootstrap("Por favor, ingresa un ID de carrito.", "warning");
      return;
    }

    if (!carrito) {
      this.mostrarAlertaBootstrap("Por favor, ingresa un ID de carrito.", "warning");
      return;
    }

    this.enServicio = true;
    this.carritoEnServicio = carrito.id;
    this.cerrarModal('modalIniciarServicio');
    this.mostrarAlertaBootstrap(`¡Ahora estás en servicio con el carrito ${carrito.id}!`, "success");
    this.carritoIdInput = '';
  }

  finalizarServicio() {
    this.enServicio = false;
    this.carritoEnServicio = null;
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
    }
  }

  cerrarModal(id: string) {
    if (id === 'modalIniciarServicio') {
      this.modalIniciarServicioVisible = false;
    } else if (id === 'modalRealizarMantenimiento') {
      this.modalRealizarMantenimientoVisible = false;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = false;
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
    let reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const idx = reservas.findIndex((r: any) => r.id === reservaId);
    if (idx !== -1) {
      reservas[idx].estado = "confirmada";
      localStorage.setItem('reservas', JSON.stringify(reservas));
      this.mostrarReservas();
      this.mostrarAlertaBootstrap("Reserva confirmada. El cliente verá el movimiento del carrito.", "success");
    }
  }

  mostrarAlertaBootstrap(mensaje: string, tipo: string = 'success', tiempo: number = 3000) {
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
      alerta.classList.remove("show");
      alerta.classList.add("hide");
      setTimeout(() => alerta.remove(), 500);
    }, tiempo);
  }
}