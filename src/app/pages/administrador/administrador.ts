import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  modalListaPerfilesVisible = false;
  modalEditarPerfilVisible = false;

  usuariosLista: any[] = [];
  perfilForm = {
    nombre: '',
    email: '',
    password: '',
    tipo: ''
  };
  usuarioSeleccionadoEmail: string = '';

  //variables para ver las reservas por filtros 
  modalFiltroRutasVisible = false;
  filtroOrigen: number | null = null;
  filtroDestino: number | null = null;
  resultadoFiltro: { cantidad: number, usuarios: string[] } | null = null;


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

  // 1. Variable para el modal y los mantenimientos
modalMantenimientosVisible = false;
mantenimientos: any[] = [];

// 2. Modifica mostrarModal y cerrarModal:
mostrarModal(id: string) {
  if (id === 'modalAgregarCarrito') {
    this.modalAgregarCarritoVisible = true;
  } else if (id === 'modalReservas') {
    this.modalReservasVisible = true;
    this.mostrarReservas();
  } else if (id === 'modalMantenimientos') {
    this.modalMantenimientosVisible = true;
    this.mostrarMantenimientos();
  } else if (id === 'modalListaPerfiles') {
    this.modalListaPerfilesVisible = true;
    this.cargarListaUsuarios();
  } else if (id === 'modalEditarPerfil') {
    this.modalEditarPerfilVisible = true;
  } else if (id === 'modalFiltroRutas') {
    this.modalFiltroRutasVisible = true;
    this.filtroOrigen = null;
    this.filtroDestino = null;
    this.resultadoFiltro = null;
  }
}

cerrarModal(id: string) {
  if (id === 'modalAgregarCarrito') {
    this.modalAgregarCarritoVisible = false;
    this.carritoIdInput = '';
    this.asientosInput = 3;
  } else if (id === 'modalReservas') {
    this.modalReservasVisible = false;
  } else if (id === 'modalMantenimientos') {
    this.modalMantenimientosVisible = false;
  } else if (id === 'modalListaPerfiles') {
    this.modalListaPerfilesVisible = false;
  } else if (id === 'modalEditarPerfil') {
    this.modalEditarPerfilVisible = false;
  } else if (id === 'modalFiltroRutas') {
    this.modalFiltroRutasVisible = false;
  }
}

// 3. Método para cargar los mantenimientos
mostrarMantenimientos() {
  this.mantenimientos = JSON.parse(localStorage.getItem('mantenimientos') || '[]');
}

agregarCarrito() {
  const id = this.carritoIdInput.trim();
  const asientos = this.asientosInput;

  // Validar que se ingresó un ID
  if (!id) {
    alert("Por favor, ingresa un ID de carrito.");
    return;
  }

  // Verificar que no exista ya un carrito con ese ID
  const carritoExistente = this.carritos.find(c => c.id === id);
  if (carritoExistente) {
    alert("Ya existe un carrito con ese ID.");
    return;
  }

  // Buscar la ubicación predeterminada (nodo 1) directamente
  let nodo = this.nodoPredeterminado;
  
  // Si nodoPredeterminado no está disponible, buscar directamente en el array
  if (!nodo) {
    nodo = this.nodos.find(n => n.id === this.UBICACION_PREDETERMINADA_ID);
  }
  
  // Si aún no se encuentra, usar coordenadas por defecto
  if (!nodo) {
    console.warn("Nodo predeterminado no encontrado, usando coordenadas por defecto");
    nodo = {
      id: 1,
      lat: -0.9545528165209427,
      lng: -80.74615240570795,
      nombre: "Ubicación Inicial"
    };
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

  // Mostrar mensaje de éxito
  alert(`Carrito ${id} agregado correctamente en ${nodo.nombre || 'Ubicación Inicial'}.`);

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

  async cargarListaUsuarios() {
    // Usuarios de localStorage
    let usuariosLS = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
    // Usuarios del JSON (assets/usuarios.json)
    let usuariosJSON: any[] = [];
    try {
      const resp = await fetch('usuarios.json');
      const data = await resp.json();
      usuariosJSON = data.usuarios || [];
    } catch (e) {
      // Si no existe el archivo o hay error, ignora
    }
  
    // Unir y eliminar duplicados por email
    const todos = [...usuariosLS, ...usuariosJSON];
    const unicos: any = {};
    todos.forEach(u => {
      unicos[u.email] = u;
    });
    this.usuariosLista = Object.values(unicos);
  }

  seleccionarUsuario(usuario: any) {
    this.perfilForm = {
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      password: usuario.password || '',
      tipo: usuario.tipo || ''
    };
    this.usuarioSeleccionadoEmail = usuario.email;
    this.cerrarModal('modalListaPerfiles');
    this.mostrarModal('modalEditarPerfil');
  }

  guardarPerfil() {
    const { nombre, email, password, tipo } = this.perfilForm;
  
    // Validaciones
    if (!nombre.trim() || !email.trim() || !password.trim() || !tipo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos.',
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
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
    // Verificar si el email ya existe (excepto el usuario actual)
    const emailExiste = usuarios.find((u: any) => u.email === email && u.email !== this.usuarioSeleccionadoEmail);
    if (emailExiste) {
      Swal.fire({
        icon: 'error',
        title: 'Email ya existe',
        text: 'Ya existe un usuario con ese email.',
      });
      return;
    }
  
    // Actualizar usuario en el array de usuarios
    const indiceUsuario = usuarios.findIndex((u: any) => u.email === this.usuarioSeleccionadoEmail);
    if (indiceUsuario !== -1) {
      usuarios[indiceUsuario] = {
        ...usuarios[indiceUsuario],
        nombre: nombre.trim(),
        email: email.trim(),
        password: password.trim(),
        tipo: tipo.trim()
      };
    } else {
      // Si no existe en localStorage, lo agregamos
      usuarios.push({
        nombre: nombre.trim(),
        email: email.trim(),
        password: password.trim(),
        tipo: tipo.trim()
      });
    }
  
    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  
    // Actualizar la lista
    this.cargarListaUsuarios();
  
    // Cerrar modal y mostrar éxito
    this.cerrarModal('modalEditarPerfil');
    Swal.fire({
      icon: 'success',
      title: '¡Perfil actualizado!',
      text: 'Los datos han sido actualizados correctamente.',
    });
  }

  //funcion para filtros

  aplicarFiltroRutas() {
    if (!this.filtroOrigen || !this.filtroDestino) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Selecciona un origen y un destino.',
      });
      return;
    }
    if (this.filtroOrigen === this.filtroDestino) {
      Swal.fire({
        icon: 'warning',
        title: 'Origen y destino iguales',
        text: 'El origen y el destino no pueden ser el mismo.',
      });
      return;
    }
  
    const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  
    // Filtrar reservas por origen y destino
    const reservasFiltradas = reservas.filter((r: any) =>
      Number(r.inicioId) === Number(this.filtroOrigen) &&
      Number(r.destinoId) === Number(this.filtroDestino)
    );
  
    // Obtener nombres de usuarios únicos
    const emails = reservasFiltradas.map((r: any) => r.clienteEmail);
    const nombresUsuarios = usuarios
      .filter((u: any) => emails.includes(u.email))
      .map((u: any) => u.nombre);
  
    this.resultadoFiltro = {
      cantidad: reservasFiltradas.length,
      usuarios: Array.from(new Set(nombresUsuarios)) // Sin duplicados
    };
  }


}