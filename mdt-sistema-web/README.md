# Sistema MDT (Mobile Data Terminal) - Houston Spanish Roleplay

Sistema web completo de gestión policial integrado con Discord Bot existente.

## ⚡ Novedades v2.0

### 🌐 Soporte para Hostings Separados
El sistema ahora soporta tener el **Bot de Discord** y la **Página Web MDT** en hostings diferentes:

- ✅ **API REST en el Bot**: El bot expone una API completa para que el MDT web pueda acceder a los datos
- ✅ **Comunicación Segura**: Autenticación con API Key entre el bot y el MDT
- ✅ **Sincronización en Tiempo Real**: Los cambios en Discord aparecen inmediatamente en la web y viceversa
- ✅ **Escalabilidad**: Bot y web pueden escalar independientemente

**📖 Guía completa:** Ver [HOSTINGS-SEPARADOS.md](./HOSTINGS-SEPARADOS.md)

## 🚀 Características Principales

### Dashboard en Tiempo Real
- Estadísticas actualizadas (arrestos, multas, denuncias, órdenes activas)
- Gráficos interactivos con Chart.js
- Actividad reciente del sistema
- Alertas importantes
- Oficiales en servicio

### Gestión de Ciudadanos
- Búsqueda avanzada por DNI, nombre, apellido
- Expediente completo con:
  * Datos personales y foto del DNI
  * Historial de arrestos con código penal
  * Historial de multas
  * Licencias vigentes
  * Vehículos registrados
  * Denuncias realizadas
  * Estado de búsqueda y captura

### Sistema de Vehículos
- Registro completo de vehículos
- Búsqueda por matrícula
- Antecedentes vehiculares
- Reportar robo
- Transferencias de propiedad
- Lista de vehículos robados

### Sistema de Denuncias
- Crear denuncia con formulario completo
- Tipos: robo, agresión, fraude, vandalismo, etc.
- Prioridades: baja, media, alta, urgente
- Sistema de seguimiento
- Agregar evidencias
- Actualizar estados

### Búsqueda y Captura
- Emitir órdenes de búsqueda
- Niveles de peligrosidad
- Reportar avistamientos
- Registrar intentos de captura
- Cerrar órdenes
- Mapa de avistamientos

### Gestión Policial Interna
- Registro de oficiales con rangos
- Divisiones: HPD, HCSO, FBI, DEA
- Historial disciplinario
- Estadísticas por oficial
- Control de estado (en servicio/fuera)

### Sistema de Reportes
- Tipos: procedimiento común, persecución, tiroteo, allanamiento, etc.
- Vincular con arrestos/multas
- Exportar a PDF
- Búsqueda avanzada

### Módulo Admin/Auditoría
- Auditoría completa de acciones
- Logs anti-abuso
- Gestión de permisos por rol
- Estadísticas globales
- Backup de datos

## 📁 Estructura del Proyecto

```
mdt-sistema-web/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── config/      # Configuración y DB
│   │   ├── controllers/ # Controladores
│   │   ├── middleware/  # Auth, audit, etc.
│   │   ├── routes/      # Rutas API
│   │   ├── services/    # Lógica de negocio
│   │   ├── utils/       # Utilidades
│   │   └── server.js    # Servidor principal
│   ├── .env.example
│   └── package.json
├── frontend/            # React + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # API calls
│   │   ├── store/       # Zustand state
│   │   ├── utils/       # Utilidades
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🛠️ Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Bot de Discord funcionando con policedb.db

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar DATABASE_PATH para apuntar a ../policedb.db
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Variables de Entorno Backend

```env
PORT=5000
DATABASE_PATH=../../policedb.db
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales

### Ciudadanos
- `GET /api/ciudadanos/search?q=` - Buscar ciudadanos
- `GET /api/ciudadanos/:dni` - Expediente completo

### Vehículos
- `GET /api/vehiculos/search?matricula=` - Buscar vehículo
- `GET /api/vehiculos/:matricula` - Info completa
- `POST /api/vehiculos` - Registrar vehículo
- `PUT /api/vehiculos/:matricula` - Actualizar

### Denuncias
- `GET /api/denuncias` - Listar denuncias
- `POST /api/denuncias` - Crear denuncia
- `GET /api/denuncias/:numero` - Ver denuncia
- `PUT /api/denuncias/:numero` - Actualizar

### Búsqueda y Captura
- `GET /api/busqueda-captura` - Listar órdenes
- `POST /api/busqueda-captura` - Emitir orden
- `GET /api/busqueda-captura/:numero` - Ver orden
- `PUT /api/busqueda-captura/:numero` - Actualizar

### Arrestos
- `GET /api/arrestos` - Listar arrestos
- `GET /api/arrestos/:id` - Ver arresto

### Multas
- `GET /api/multas` - Listar multas

### Oficiales
- `GET /api/oficiales` - Listar oficiales
- `POST /api/oficiales` - Registrar oficial
- `GET /api/oficiales/:id` - Ver oficial
- `PUT /api/oficiales/:id` - Actualizar

### Reportes
- `GET /api/reportes` - Listar reportes
- `POST /api/reportes` - Crear reporte
- `GET /api/reportes/:numero` - Ver reporte

### Admin
- `GET /api/admin/auditoria` - Ver auditoría
- `GET /api/admin/logs` - Ver logs
- `GET /api/admin/stats` - Estadísticas admin

## 🎨 Tecnologías

### Backend
- Node.js + Express
- SQLite (compartida con Discord Bot)
- JWT Authentication
- Socket.io (tiempo real)
- bcryptjs (passwords)
- express-validator
- helmet (seguridad)
- morgan (logs)

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Chart.js + react-chartjs-2
- Zustand (state management)
- Socket.io-client
- React Query
- date-fns

## 👥 Roles y Permisos

- **Admin**: Acceso total, gestión de usuarios, auditoría completa
- **Jefatura**: Gestión completa, sin borrar auditoría
- **Supervisor**: Acceso operativo, editar arrestos/multas
- **Oficial**: Crear arrestos/multas/denuncias, ver expedientes
- **Cadete**: Solo lectura, acceso limitado

## 🔄 Sincronización con Discord

El sistema comparte la base de datos SQLite (`policedb.db`) con el bot de Discord:

- ✅ Cambios en Discord → Aparecen en la web en tiempo real
- ✅ Cambios en la web → Se registran en la misma BD
- ✅ Auditoría completa de todas las acciones
- ✅ Sin conflictos gracias a transacciones SQLite

## 🔒 Seguridad

- JWT tokens con expiración
- Refresh tokens
- Validación de permisos en cada endpoint
- Rate limiting (100 req/15min por IP)
- Sanitización de inputs
- Protección contra SQL injection
- HTTPS obligatorio en producción
- Logs de todos los accesos
- Auditoría de todas las acciones

## 📝 Licencia

Privado - Houston Spanish Roleplay

## 🤝 Soporte

Para soporte técnico, contacta al equipo de desarrollo.
