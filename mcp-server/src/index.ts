import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  currentMileage: number;
  notes?: string;
  createdAt: string;
}

interface Maintenance {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  mileage: number;
  description: string;
  cost?: number;
  nextDueMileage?: number;
  nextDueDate?: string;
  createdAt: string;
}

interface Data {
  vehicles: Vehicle[];
  maintenances: Maintenance[];
}

async function loadData(): Promise<Data> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return { vehicles: [], maintenances: [] };
  }
}

async function saveData(data: Data): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

const server = new McpServer({
  name: "auto-log",
  version: "1.0.0",
});

// ========== VEHICLES ==========

server.tool(
  "list_vehicles",
  "Lista todos los vehículos registrados",
  {},
  async () => {
    const data = await loadData();
    return {
      content: [{ type: "text", text: JSON.stringify(data.vehicles, null, 2) }],
    };
  }
);

server.tool(
  "get_vehicle",
  "Obtiene los detalles de un vehículo por su ID",
  {
    vehicleId: z.string().describe("ID del vehículo"),
  },
  async ({ vehicleId }) => {
    const data = await loadData();
    const vehicle = data.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return { content: [{ type: "text", text: "Vehículo no encontrado" }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(vehicle, null, 2) }],
    };
  }
);

server.tool(
  "add_vehicle",
  "Agrega un nuevo vehículo a la libreta",
  {
    name: z.string().describe("Nombre (ej: Mi Toyota Corolla)"),
    make: z.string().describe("Marca"),
    model: z.string().describe("Modelo"),
    year: z.number().int().min(1900).max(2100).describe("Año"),
    plate: z.string().describe("Patente"),
    currentMileage: z.number().min(0).describe("Kilometraje actual"),
    notes: z.string().optional().describe("Notas adicionales"),
  },
  async ({ name, make, model, year, plate, currentMileage, notes }) => {
    const data = await loadData();
    const vehicle: Vehicle = {
      id: generateId(),
      name,
      make,
      model,
      year,
      plate,
      currentMileage,
      notes,
      createdAt: new Date().toISOString(),
    };
    data.vehicles.push(vehicle);
    await saveData(data);
    return {
      content: [
        {
          type: "text",
          text: `Vehículo agregado correctamente:\n${JSON.stringify(vehicle, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_mileage",
  "Actualiza el kilometraje actual de un vehículo",
  {
    vehicleId: z.string().describe("ID del vehículo"),
    mileage: z.number().min(0).describe("Nuevo kilometraje"),
  },
  async ({ vehicleId, mileage }) => {
    const data = await loadData();
    const vehicle = data.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return { content: [{ type: "text", text: "Vehículo no encontrado" }] };
    }
    vehicle.currentMileage = mileage;
    await saveData(data);
    return {
      content: [
        {
          type: "text",
          text: `Kilometraje actualizado a ${mileage} km para ${vehicle.name}`,
        },
      ],
    };
  }
);

// ========== MAINTENANCE ==========

server.tool(
  "add_maintenance",
  "Registra una mantención para un vehículo",
  {
    vehicleId: z.string().describe("ID del vehículo"),
    type: z.string().describe("Tipo (aceite, filtros, frenos, revisión técnica, neumáticos, etc.)"),
    date: z.string().describe("Fecha (YYYY-MM-DD)"),
    mileage: z.number().min(0).describe("Kilometraje al momento del servicio"),
    description: z.string().describe("Descripción del trabajo realizado"),
    cost: z.number().min(0).optional().describe("Costo"),
    nextDueMileage: z.number().optional().describe("Próximo kilometraje de mantención"),
    nextDueDate: z.string().optional().describe("Próxima fecha de mantención (YYYY-MM-DD)"),
  },
  async (args) => {
    const data = await loadData();
    const vehicle = data.vehicles.find((v) => v.id === args.vehicleId);
    if (!vehicle) {
      return { content: [{ type: "text", text: "Vehículo no encontrado" }] };
    }

    const maintenance: Maintenance = {
      id: generateId(),
      ...args,
      createdAt: new Date().toISOString(),
    };

    data.maintenances.push(maintenance);

    // Actualizar kilometraje del vehículo si es mayor
    if (args.mileage > vehicle.currentMileage) {
      vehicle.currentMileage = args.mileage;
    }

    await saveData(data);
    return {
      content: [
        {
          type: "text",
          text: `Mantención registrada:\n${JSON.stringify(maintenance, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "list_maintenance",
  "Lista el historial de mantenciones de un vehículo",
  {
    vehicleId: z.string().describe("ID del vehículo"),
  },
  async ({ vehicleId }) => {
    const data = await loadData();
    const list = data.maintenances
      .filter((m) => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  }
);

server.tool(
  "get_upcoming",
  "Obtiene las mantenciones próximas o vencidas",
  {
    kmThreshold: z.number().optional().default(3000).describe("Umbral de km para considerar próximo"),
  },
  async ({ kmThreshold }) => {
    const data = await loadData();
    const upcoming = data.maintenances
      .filter((m) => m.nextDueMileage)
      .map((m) => {
        const vehicle = data.vehicles.find((v) => v.id === m.vehicleId);
        const kmLeft = (m.nextDueMileage || 0) - (vehicle?.currentMileage || 0);
        return {
          ...m,
          vehicleName: vehicle?.name || "Desconocido",
          vehiclePlate: vehicle?.plate,
          kmLeft,
          status: kmLeft <= 0 ? "VENCIDO" : kmLeft <= kmThreshold ? "PRÓXIMO" : "OK",
        };
      })
      .filter((m) => m.kmLeft <= kmThreshold)
      .sort((a, b) => a.kmLeft - b.kmLeft);

    return {
      content: [{ type: "text", text: JSON.stringify(upcoming, null, 2) }],
    };
  }
);

server.tool(
  "delete_maintenance",
  "Elimina un registro de mantención",
  {
    maintenanceId: z.string().describe("ID de la mantención a eliminar"),
  },
  async ({ maintenanceId }) => {
    const data = await loadData();
    const index = data.maintenances.findIndex((m) => m.id === maintenanceId);
    if (index === -1) {
      return { content: [{ type: "text", text: "Mantención no encontrada" }] };
    }
    const deleted = data.maintenances.splice(index, 1)[0];
    await saveData(data);
    return {
      content: [
        {
          type: "text",
          text: `Mantención eliminada: ${deleted.type} (${deleted.date})`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Auto-Log MCP server running on stdio");
}

main().catch((err) => {
  console.error("Error al iniciar el servidor MCP:", err);
  process.exit(1);
});
