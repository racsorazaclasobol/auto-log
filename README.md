# Auto-Log

**Libreta de mantención vehicular** — App web y mobile + integración con agentes de IA vía MCP.

Inspirada en las libretas de salud de las mascotas, pero aplicada a los vehículos de uso cotidiano.

## Características

- Registro de vehículos (marca, modelo, año, patente, kilometraje)
- Historial de mantenciones (aceite, filtros, frenos, revisión técnica, etc.)
- Recordatorios por kilometraje
- **Servidor MCP** para que Grok Bots y otros agentes puedan:
  - Consultar el estado de los vehículos
  - Registrar mantenciones
  - Revisar qué servicios están próximos o vencidos

## Estructura

```
auto-log/
├── app/                  # App Expo (Web + iOS + Android)
├── mcp-server/           # Servidor MCP (tools para agentes)
├── .gitignore
└── README.md
```

## Cómo empezar

### 1. App móvil / web

```bash
cd app
npm install
npx expo start
```

### 2. Servidor MCP (para agentes)

```bash
cd mcp-server
npm install
npm start
```

Luego configura tu Grok Bot o cliente MCP para conectarse al servidor.

## MCP Tools

- `list_vehicles` / `get_vehicle` / `add_vehicle` / `update_mileage`
- `add_maintenance` / `list_maintenance` / `delete_maintenance`
- `get_upcoming`

## Estado actual

- [x] Servidor MCP funcional con almacenamiento JSON
- [x] Estructura base de la app Expo
- [ ] Persistencia real en la app (SQLite)
- [ ] Formularios completos
- [ ] Sincronización entre app y MCP
- [ ] Notificaciones de recordatorios

Creado con asistencia de Grok.
