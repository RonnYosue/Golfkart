import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-usuario-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.css']
})
export class Administrador implements OnInit {

  constructor(private router: Router) {}
  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;

  saludo: string = '';
  sidebarCollapsed = false;

  modalAgregarCarritoVisible = false;
  modalReservasVisible = false;

  nodos: any[] = [];
  conexiones: any[] = [];
  carritos: any[] = [];
  carritoMarkers: any[] = [];
  reservas: any[] = [];

  UBICACION_PREDETERMINADA_ID = 1;
  nodoPredeterminado: any = null;

  carritoIdInput: string = '';
  asientosInput: number = 3;
  ubicacionSeleccionada: number = 1;

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

  async initMap() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: -0.9527943857230249, lng: -80.74554766436874 },
      zoom: 17,
      minZoom: 17,
      maxZoom: 25
    });

    await this.cargarDatos();
    this.mostrarNodos();
    this.dibujarConexiones();
  }

  async cargarDatos() {
    // Cargar nodos
    const response = await fetch('assets/json/nodos.json');
    const data = await response.json();
    this.nodos = data.nodos;

    // Llenar select de ubicación solo con la predeterminada
    this.nodoPredeterminado = this.nodos.find(n => n.id == this.UBICACION_PREDETERMINADA_ID);
    this.ubicacionSeleccionada = this.nodoPredeterminado ? this.nodoPredeterminado.id : 1;

    // Cargar conexiones
    const conexionesResponse = await fetch('assets/json/conexiones.json');
    const conexionesData = await conexionesResponse.json();
    this.conexiones = conexionesData.conexiones;

    // Cargar carritos guardados
    this.carritos = JSON.parse(localStorage.getItem('carritos') || '[]');
    this.carritos.forEach(carrito => {
      this.agregarMarkerCarrito(carrito);
    });
  }

  agregarMarkerCarrito(carrito: any) {
    const marker = new google.maps.Marker({
      position: { lat: carrito.lat, lng: carrito.lng },
      map: this.map,
      title: `Carrito ${carrito.id}`,
      icon: {
        url: "assets/image/car.png",
        scaledSize: new google.maps.Size(50, 50)
      }
    });
    this.carritoMarkers.push(marker);
  }

  mostrarNodos() {
    // Si quieres mostrar todos los nodos como marcadores, descomenta esto:
    // this.nodos.forEach(nodo => {
    //   new google.maps.Marker({
    //     position: { lat: nodo.lat, lng: nodo.lng },
    //     map: this.map,
    //     title: nodo.nombre,
    //     label: `${nodo.id}`
    //   });
    // });
  }

  dibujarConexiones() {
    this.conexiones.forEach(conexion => {
      const origen = this.nodos.find(n => n.id === conexion.origen);
      const destino = this.nodos.find(n => n.id === conexion.destino);

      const ruta = new google.maps.Polyline({
        path: [
          { lat: origen.lat, lng: origen.lng },
          { lat: destino.lat, lng: destino.lng }
        ],
        geodesic: true,
        strokeColor: "#00bcd4",
        strokeOpacity: 1.0,
        strokeWeight: 3
      });

      ruta.setMap(this.map);
    });
  }

  mostrarModal(id: string) {
    if (id === 'modalAgregarCarrito') {
      this.modalAgregarCarritoVisible = true;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = true;
      this.mostrarReservas();
    }
  }

  cerrarModal(id: string) {
    if (id === 'modalAgregarCarrito') {
      this.modalAgregarCarritoVisible = false;
      this.carritoIdInput = '';
      this.asientosInput = 3;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = false;
    }
  }

  agregarCarrito() {
    const id = this.carritoIdInput.trim();
    const asientos = this.asientosInput;

    // Buscar la ubicación predeterminada
    const nodo = this.nodoPredeterminado;
    if (!nodo) {
      alert("Ubicación predeterminada no encontrada.");
      return;
    }

    const nuevoCarrito = {
      id,
      lat: nodo.lat,
      lng: nodo.lng,
      asientos
    };
    this.carritos.push(nuevoCarrito);
    localStorage.setItem('carritos', JSON.stringify(this.carritos));

    this.agregarMarkerCarrito(nuevoCarrito);

    this.cerrarModal('modalAgregarCarrito');
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  irCrearUsuario() {
  this.router.navigate(['/registro']);
  }

  // ---------------------- RESERVAS ----------------------
  realizarReserva() {
    this.mostrarModal('modalReservas');
    this.mostrarReservas();
  }

  mostrarReservas() {
    this.reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  }
}