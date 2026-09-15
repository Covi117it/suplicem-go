import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { sendDriverLocation } from "./tripsService";

export const DRIVER_LOCATION_TASK_NAME = "DRIVER_BACKGROUND_LOCATION_TASK";


TaskManager.defineTask(DRIVER_LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("❌ Error en tarea de ubicación en segundo plano:", error.message);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const latestLocation = locations[locations.length - 1];
      const { latitude, longitude } = latestLocation.coords;

      try {
        await sendDriverLocation(latitude, longitude);
        console.log(`📡 Ubicación background enviada: Lat: ${latitude}, Lng: ${longitude}`);
      } catch (err) {
        console.error("❌ Error enviando ubicación en segundo plano:", err);
      }
    }
  }
});

// solicitud de permisos y configuración de la tarea de ubicación en segundo plano
export async function startBackgroundLocationUpdates(): Promise<boolean> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") {
    return false;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== "granted") {
    return false;
  }

  const isStarted = await Location.hasStartedLocationUpdatesAsync(
    DRIVER_LOCATION_TASK_NAME
  );

  if (!isStarted) {
    await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,    
      distanceInterval: 10,  
      foregroundService: {
        notificationTitle: "Suplicem Go en ruta",
        notificationBody: "Transmitiendo ubicación del viaje en tiempo real...",
        notificationColor: "#E31E24",
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });
  }

  return true;
}


export async function stopBackgroundLocationUpdates(): Promise<void> {
  const isStarted = await Location.hasStartedLocationUpdatesAsync(
    DRIVER_LOCATION_TASK_NAME
  );
  if (isStarted) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK_NAME);
    console.log("🛑 Rastreo en segundo plano detenido.");
  }
}