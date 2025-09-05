# Turnero Peluquería

Sistema de gestión de turnos para peluquería desarrollado con Next.js, TypeScript, MongoDB y Tailwind CSS. Diseñado con enfoque mobile-first para facilitar la gestión de citas desde dispositivos móviles.

## Características

- **Gestión de Turnos**: Vista de calendario vertical con timeline cronológico
- **Roles de Usuario**: Administrador y Peluquero con permisos configurables
- **Formulario Completo**: Datos del cliente, peluquero, servicio, costos y estado
- **Panel de Administración**: Gestión de usuarios y permisos
- **Diseño Mobile-First**: Optimizado para dispositivos móviles
- **Autenticación**: Sistema seguro con JWT
- **Base de Datos**: MongoDB para persistencia de datos

## Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT con bcryptjs
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Fechas**: date-fns

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd turnero-peluqueria
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local` con:
```env
MONGODB_URI=mongodb://localhost:27017/turnero-peluqueria
NEXTAUTH_SECRET=tu-clave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=tu-jwt-secreto-aqui
```

4. **Inicializar la base de datos**
```bash
# Ejecutar el servidor
npm run dev

# En otra terminal, inicializar datos
curl -X POST http://localhost:3000/api/init
```

5. **Acceder a la aplicación**
- URL: http://localhost:3000
- Admin: admin@peluqueria.com / admin123
- Peluquero: maria@peluqueria.com / peluquero123

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── appointments/  # Gestión de turnos
│   │   ├── users/         # Gestión de usuarios
│   │   └── init/          # Inicialización
│   ├── admin/             # Panel de administración
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── AppointmentCard.tsx
│   ├── AppointmentForm.tsx
│   └── TimelineCalendar.tsx
├── lib/                  # Utilidades
│   ├── auth.ts          # Funciones de autenticación
│   └── mongodb.ts       # Conexión a MongoDB
├── models/              # Modelos de Mongoose
│   ├── User.ts
│   └── Appointment.ts
└── types/               # Tipos TypeScript
```

## Funcionalidades

### Para Administradores
- ✅ Crear, editar y eliminar turnos
- ✅ Gestionar peluqueros y sus permisos
- ✅ Ver todos los turnos del sistema
- ✅ Configurar permisos de creación/modificación

### Para Peluqueros
- ✅ Ver calendario de turnos
- ✅ Crear turnos (si tiene permisos)
- ✅ Modificar turnos (si tiene permisos)
- ✅ Ver solo sus turnos asignados

### Gestión de Turnos
- ✅ Datos del cliente (nombre, apellido, teléfono)
- ✅ Selección de peluquero
- ✅ Fecha y hora del turno
- ✅ Tipo de servicio
- ✅ Duración estimada
- ✅ Costo total
- ✅ Estado del turno (pendiente, confirmado, completado, cancelado)
- ✅ Gestión de seña (para turnos confirmados)
- ✅ Comentarios adicionales

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint
```

## Configuración de MongoDB

### Local
```bash
# Instalar MongoDB
# Windows: Descargar desde https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Iniciar MongoDB
mongod
```

### MongoDB Atlas (Cloud)
1. Crear cuenta en https://www.mongodb.com/atlas
2. Crear cluster gratuito
3. Obtener string de conexión
4. Actualizar `MONGODB_URI` en `.env.local`

## Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
```

### Otros Proveedores
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Estructura de la Base de Datos

### Colección Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'hairdresser',
  canCreateAppointments: Boolean,
  canModifyAppointments: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Colección Appointments
```javascript
{
  clientName: String,
  clientLastName: String,
  clientPhone: String,
  hairdresserName: String,
  hairdresserId: String,
  date: Date,
  time: String,
  service: String,
  estimatedDuration: Number, // minutos
  totalCost: Number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  deposit: Number (opcional),
  additionalComments: String (opcional),
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## Soporte

Para soporte o preguntas, crear un issue en el repositorio de GitHub.
