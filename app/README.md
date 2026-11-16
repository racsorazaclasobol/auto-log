# Auto-Log App (Expo)

Aplicación multiplataforma (Web + iOS + Android) para llevar la libreta de mantención de tus vehículos.

## Inicio rápido

```bash
cd app
npm install
npx expo start
```

## Estructura de pantallas planeadas

- **Home**: Lista de vehículos con kilometraje actual
- **Vehicle Detail**: Historial de mantenciones + botón para agregar
- **Add Vehicle**: Formulario para registrar un nuevo auto
- **Add Maintenance**: Registrar un servicio

## Base de datos

Usa `expo-sqlite` para almacenamiento local (sin necesidad de internet).

## Integración con MCP

El servidor MCP (`../mcp-server`) puede operar de forma independiente. 
En el futuro se puede conectar la app a un backend compartido para que los agentes y la app usen los mismos datos.
