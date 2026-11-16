# MCP Server - Auto-Log

Servidor MCP que expone tools para que agentes (Grok Bots, Claude, etc.) puedan gestionar la libreta vehicular.

## Instalación

```bash
cd mcp-server
npm install
```

## Ejecución (stdio)

```bash
npm start
```

## Tools disponibles

| Tool | Descripción |
|------|-------------|
| `list_vehicles` | Lista todos los vehículos |
| `add_vehicle` | Agrega un vehículo |
| `get_vehicle` | Detalles de un vehículo por ID |
| `update_mileage` | Actualiza el kilometraje actual |
| `add_maintenance` | Registra una mantención |
| `list_maintenance` | Historial de mantenciones |
| `get_upcoming` | Mantenciones próximas |
| `delete_maintenance` | Elimina un registro de mantención |

Los datos se guardan en `data.json` (se puede reemplazar fácilmente por una base de datos).
