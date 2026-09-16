import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const getTripAvailable = async () => {
  const response = await protectedApi.get("/trips/available");
  return response.data;
};

export const getAllTrips = async () => {
  const response = await protectedApi.get("/trips");
  return response.data;
};

export const getDriverTripsHistory = async () => {
  const response = await protectedApi.get("/trips/driver/history");
  return response.data;
};

export const getDriverActualTrips = async () => {
  return await safeRequest(() => protectedApi.get("/trips/driver/actual"));
};

export const getDriverActiveTrip = async () => {
  return await safeRequest(() => protectedApi.get("/trips/driver/active"));
};

export const aceptedTrip = async (id: string) => {
  return await safeRequest(() => protectedApi.patch(`/trips/${id}/accept`));
};

export const getTripDetail = async (id: string) => {
  const response = await safeRequest(() => protectedApi.get(`/trips/${id}`));
  return response.data;
};

export const getTripByOrderId = async (orderId: string) => {
  const response = await safeRequest(() => protectedApi.get(`/trips/order/${orderId}`));
  return response.data;
};

export const createTrip = async (
  tripNumber: string,
  orderIds: string[],
  totalTons: number,
  comments: string
) => {
  const response = await protectedApi.post("/trips", {
    tripNumber,
    orderIds,
    totalTons,
    comments,
  });
  return response.data;
};

export const createTripWithOrders = async (data: {
  tripNumber: string;
  orderIds: string[];
  driverId?: string;
  totalTons: number;
  comments?: string;
  deliveries?: any[];
}) => {
  const result = await safeRequest(() =>
    protectedApi.post("/trips/create-with-orders", data)
  );
  if (result.success && result.data) {
    return result.data;
  }
  return {
    success: false,
    message: result.message || "Error al crear el viaje.",
  };
};

export const updateTripStatus = async (tripId: string, status: string) => {
  const result = await safeRequest(() =>
    protectedApi.patch(`/trips/${tripId}/status`, {
      status,
    })
  );
  if (result.success) {
    return result.data;
  }
  return {
    success: false,
    message: result.message,
  };
};

export const startOrCancelrip = async (tripId: string, status: string) => {
  return await updateTripStatus(tripId, status);
};

export const sendDriverLocation = async (lat: number, lng: number) => {
  return await safeRequest(() => protectedApi.post("/location", { lat, lng }));
};

export const getDriverLocation = async (driverId: string) => {
  const response = await safeRequest(() => protectedApi.get(`/location/${driverId}`));
  return response.data;
};
