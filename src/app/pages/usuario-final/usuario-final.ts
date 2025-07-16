import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare var google: any;
declare var Swal: any;

@Component({
  selector: 'app-usuario-final',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-final.html',
  styleUrls: ['./usuario-final.css']
})
export class UsuarioFinal implements OnInit {
  @ViewChild('mapContainer', { static: true }) mapElement!: ElementRef;

  constructor(private router: Router) {}
  saludo: string = '';
  sidebarCollapsed = false;

  modalReservaVisible = false;
  modalReservasVisible = false;

  nodos: any[] = [];
  conexiones: any[] = [];
  carritos: any[] = [];
  carritoMarkers: any[] = [];
  marker: any;
  map: any;
  rutaActual: any = null;

  reservasFiltradas: any[] = [];

  lugares = [
    { id: 1, nombre: 'PUERTA UNO' },
    { id: 2, nombre: 'PARANINFO' },
    { id: 3, nombre: 'FACULTAD EDUCACION' },
    { id: 4, nombre: 'FACULTAD ODONTOLOGIA' },
    { id: 5, nombre: 'TASTY FOOD UNO' },
    { id: 6, nombre: 'FACULTAD TURISMO' },
    { id: 7, nombre: 'FACULTAD GASTRONOMIA' },
    { id: 8, nombre: 'CANCHAS MULTIPLES' },
    { id: 10, nombre: 'FACULTAD ARQUITECTURA' },
    { id: 13, nombre: 'TASTY FOOD DOS' },
    { id: 16, nombre: 'FACULTAD INGENIERIA' },
    { id: 17, nombre: 'TASTY FOOD TRES' },
    { id: 19, nombre: 'FACCI' },
    { id: 20, nombre: 'INSTITUTO DE IDIOMAS' },
    { id: 22, nombre: 'DANNU' },
    { id: 24, nombre: 'FACULTAD DERECHO' },
    { id: 26, nombre: 'CINE ULEAM' },
    { id: 27, nombre: 'PUERTA DOS' },
    { id: 31, nombre: 'FACULTAD ENFERMERIA' },
    { id: 32, nombre: 'FACULTAD MEDICINA' },
    { id: 35, nombre: 'FACULTAD PSICOLOGIA' },
    { id: 36, nombre: 'FACULTAD FISIOTERAPIA' },
    { id: 37, nombre: 'FACULTAD AGROPECUARIA' },
    { id: 39, nombre: 'FACULTAD TRABAJO SOCIAL' },
    { id: 41, nombre: 'ESCUELA CONDUCCION' },
    { id: 42, nombre: 'FACULTAD BIOLOGIA' },
    { id: 43, nombre: 'TERCERA PUERTA' },
    { id: 44, nombre: 'FACULTAD AUDITORIA' },
    { id: 45, nombre: 'FACULTAD ING INDUSTRIAL' },
    { id: 47, nombre: 'FACULTAD ECONOMIA' },
    { id: 48, nombre: 'FACCO' },
    { id: 21, nombre: 'FACULTAD EDUCACION DOS' }
  ];

  reservaForm = {
    fecha: '',
    hora: '',
    inicioId: null,
    destinoId: null,
    asientos: 1
  };

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
      center: { lat: -0.9545528165209427, lng: -80.74615240570795 },
      zoom: 17,
      minZoom: 17,
      maxZoom: 25
    });

    await this.cargarDatos();
    this.mostrarNodos();
    this.dibujarConexiones();
    this.cargarCarritos();

    this.marker = new google.maps.Marker({
      position: { lat: -0.9545528165209427, lng: -80.74615240570795 },
      map: this.map,
      title: "Haz clic para reservar este carrito",
      icon: {
        url: "car.png",
        scaledSize: new google.maps.Size(50, 50)
      }
    });
    this.marker.addListener("click", () => {
      this.mostrarModal('modalReserva');
    });

    this.revisarReservasConfirmadas();
  }

  async cargarDatos() {
    // Cargar nodos
    const nodosResp = await fetch('nodos.json');
    const nodosData = await nodosResp.json();
    this.nodos = nodosData.nodos;

    // Cargar conexiones
    const conexionesResp = await fetch('conexiones.json');
    const conexionesData = await conexionesResp.json();
    this.conexiones = conexionesData.conexiones;
  }

  cargarCarritos() {
    this.carritos = JSON.parse(localStorage.getItem('carritos') || '[]');
    this.carritos.forEach(carrito => {
      const nuevoMarker = new google.maps.Marker({
        position: { lat: carrito.lat, lng: carrito.lng },
        map: this.map,
        title: `Carrito ${carrito.id}`,
        icon: {
          url: "car.png",
          scaledSize: new google.maps.Size(50, 50)
        }
      });
      this.carritoMarkers.push(nuevoMarker);
      nuevoMarker.addListener("click", () => {
        this.mostrarModal('modalReserva');
      });
    });
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
      const origen = this.nodos.find(n => n.id === Number(conexion.origen));
      const destino = this.nodos.find(n => n.id === Number(conexion.destino));

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

  dijkstra(nodos: any[], conexiones: any[], inicioId: number, destinoId: number): number[] {
    // Asegura que todos los IDs sean number
    const grafo: any = {};
    nodos.forEach(n => grafo[Number(n.id)] = []);
    conexiones.forEach(c => {
      grafo[Number(c.origen)].push({ id: Number(c.destino), peso: c.peso });
      grafo[Number(c.destino)].push({ id: Number(c.origen), peso: c.peso });
    });

    const dist: any = {};
    const prev: any = {};
    const visitados = new Set<number>();
    nodos.forEach(n => dist[Number(n.id)] = Infinity);
    dist[inicioId] = 0;

    while (visitados.size < nodos.length) {
      let u: number | null = null;
      let minDist = Infinity;
      for (let id in dist) {
        if (!visitados.has(Number(id)) && dist[id] < minDist) {
          minDist = dist[id];
          u = Number(id);
        }
      }
      if (u === null) break;
      visitados.add(u);
      grafo[u].forEach((vecino: any) => {
        if (!visitados.has(vecino.id)) {
          let alt = dist[u] + vecino.peso;
          if (alt < dist[vecino.id]) {
            dist[vecino.id] = alt;
            prev[vecino.id] = u;
          }
        }
      });
    }

    let camino: number[] = [];
    let actual: any = destinoId;
    while (actual !== undefined) {
      camino.unshift(actual);
      actual = prev[actual];
    }
    if (camino[0] !== inicioId) return [];
    return camino;
  }

  moveSmoothly(marker: any, path: any[], speed = 0.05) {
    let index = 0;
    const animate = () => {
      if (index >= path.length - 1) {
        Swal.fire({
          icon: 'success',
          title: '¡Llegaste al destino!',
          text: 'El carrito ha llegado a su destino correctamente.',
          confirmButtonColor: '#00bcd4'
        });
        return;
      }
      const start = path[index];
      const end = path[index + 1];
      const deltaLat = end.lat - start.lat;
      const deltaLng = end.lng - start.lng;
      let progress = 0;
      const step = () => {
        progress += speed;
        if (progress >= 1) {
          marker.setPosition(end);
          index++;
          animate();
          return;
        }
        const intermediate = {
          lat: start.lat + deltaLat * progress,
          lng: start.lng + deltaLng * progress,
        };
        marker.setPosition(intermediate);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animate();
  }

  confirmarReserva() {
    const { fecha, hora, inicioId, destinoId, asientos } = this.reservaForm;

    // Validaciones
    if (!fecha) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Por favor, selecciona una fecha para la reserva.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha + "T00:00:00");
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'No puedes seleccionar una fecha en el pasado.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    if (!hora) {
      Swal.fire({
        icon: 'warning',
        title: 'Hora requerida',
        text: 'Por favor, selecciona una hora para la reserva.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    if (!inicioId || !destinoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Ubicación requerida',
        text: 'Por favor, selecciona tanto el punto de inicio como el de destino.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    if (Number(inicioId) === Number(destinoId)) {
      Swal.fire({
        icon: 'warning',
        title: 'Ubicaciones iguales',
        text: 'El punto de inicio y destino no pueden ser el mismo.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    if (!asientos || asientos < 1 || asientos > 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad de asientos inválida',
        text: 'Por favor, selecciona una cantidad de asientos válida.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }

    // Forzar a number los IDs
    const camino = this.dijkstra(this.nodos, this.conexiones, Number(inicioId), Number(destinoId));
    if (camino.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Sin ruta disponible',
        text: 'No hay ruta disponible entre los puntos seleccionados.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    const user = JSON.parse(sessionStorage.getItem("usuarioActivo") || '{}');
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const nuevaReserva = {
      id: "reserva-" + Date.now(),
      carritoId: "Por asignar",
      clienteEmail: user.email,
      fecha,
      hora,
      inicioId: Number(inicioId),
      destinoId: Number(destinoId),
      estado: "pendiente"
    };
    reservas.push(nuevaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));
    this.cerrarModal('modalReserva');
    Swal.fire({
      icon: 'success',
      title: '¡Reserva confirmada!',
      text: 'Tu reserva ha sido registrada y está pendiente de confirmación por un chofer.',
      confirmButtonColor: '#00bcd4'
    });
    this.reservaForm = { fecha: '', hora: '', inicioId: null, destinoId: null, asientos: 1 };
  }

  realizarReserva() {
    this.mostrarModal('modalReservas');
    this.mostrarReservas();
  }

  mostrarReservas() {
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const user = JSON.parse(sessionStorage.getItem("usuarioActivo") || '{}');
    this.reservasFiltradas = reservas.filter((r: any) => r.clienteEmail === user.email);
  }

  iniciarViajeCliente(reserva: any) {
    // Forzar a number los IDs
    const inicioId = Number(reserva.inicioId);
    const destinoId = Number(reserva.destinoId);

    // Logs para depuración
    const nodoInicio = this.nodos.find(n => Number(n.id) === inicioId);
    const nodoDestino = this.nodos.find(n => Number(n.id) === destinoId);
    console.log('Nodo inicio:', nodoInicio, 'Nodo destino:', nodoDestino);

    const camino = this.dijkstra(this.nodos, this.conexiones, inicioId, destinoId);
    console.log('Camino calculado:', camino);

    if (camino.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Sin ruta disponible',
        text: 'No hay ruta disponible entre los puntos seleccionados.',
        confirmButtonColor: '#00bcd4'
      });
      return;
    }
    const path = camino.map((id: number) => {
      const nodo = this.nodos.find(n => Number(n.id) === id);
      return { lat: nodo.lat, lng: nodo.lng };
    });
    if (this.rutaActual) this.rutaActual.setMap(null);
    this.rutaActual = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#ff0000",
      strokeOpacity: 1.0,
      strokeWeight: 4
    });
    this.rutaActual.setMap(this.map);
    this.moveSmoothly(this.marker, path, 0.01);
    Swal.fire({
      icon: 'success',
      title: '¡Viaje iniciado!',
      text: 'El carrito está en camino a tu destino.',
      confirmButtonColor: '#00bcd4'
    });
  }

  revisarReservasConfirmadas() {
    // Puedes mostrar una notificación si lo deseas
  }

  mostrarModal(id: string) {
    if (id === 'modalReserva') {
      this.modalReservaVisible = true;
    } else if (id === 'modalReservas') {
      this.modalReservasVisible = true;
      this.mostrarReservas();
    }
  }

  cerrarModal(id: string) {
    if (id === 'modalReserva') {
      this.modalReservaVisible = false;
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
}