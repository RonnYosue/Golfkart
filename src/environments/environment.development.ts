// Configuración de entorno para desarrollo
// IMPORTANTE: Este archivo SÍ se sube a Git pero sin valores sensibles

export const environment = {
  production: false,
  // En desarrollo, estos valores se pueden dejar vacíos
  // y usar datos mock del localStorage o un servidor local
  apiUrl: 'http://localhost:3000/api',
  mapsApiKey: '', // Agregar tu API key de Google Maps

  // Flag para usar datos mock en lugar de API real
  useMockData: true,
};
