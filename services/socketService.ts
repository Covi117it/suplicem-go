import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketBaseUrl(): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.0.0.190:3000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export const socketService = {
  connect(token?: string): Socket {
    if (socket?.connected) return socket;

    const baseUrl = getSocketBaseUrl();

    socket = io(baseUrl, {
      auth: { token: token || "" },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("⚡ [WebSocket Móvil] Conectado exitosamente al servidor");
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ [WebSocket Móvil] Error de conexión:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 [WebSocket Móvil] Desconectado:", reason);
    });

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log("🛑 [WebSocket Móvil] Conexión cerrada manualmente");
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  isConnected(): boolean {
    return Boolean(socket?.connected);
  },

  emitDriverLocation(payload: {
    tripId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
  }) {
    if (socket?.connected) {
      socket.emit("driver:location", payload);
    }
  },

  joinTrip(tripId: string) {
    if (!socket || !tripId) return;
    if (socket.connected) {
      socket.emit("client:watch_trip", tripId);
    } else {
      socket.once("connect", () => {
        socket?.emit("client:watch_trip", tripId);
      });
    }
  },

  leaveTrip(tripId: string) {
    if (socket?.connected && tripId) {
      socket.emit("client:leave_trip", tripId);
    }
  },

  onLocationUpdate(
    callback: (data: {
      tripId: string;
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
    }) => void
  ): () => void {
    if (!socket) return () => {};
    socket.on("trip:location_update", callback);
    return () => {
      socket?.off("trip:location_update", callback);
    };
  },
};
