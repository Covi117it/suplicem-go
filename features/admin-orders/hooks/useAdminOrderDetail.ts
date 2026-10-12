import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { useOrders } from "@/context/orderContext";
import { useLoading } from "@/context/loadingContext";
import { useAlert } from "@/context/alertContext";
import {
  approveOrder as approveOrderService,
  rejectedOrder as rejectOrderService,
  getOrderDetail,
} from "@/services/orderService";
import { getTripByOrderId, getAllTrips, createTrip } from "@/services/tripsService";
import { getUsers } from "@/services/userService";
import { User } from "@/types/users";
import { Order } from "@/types/orders";
import { Trip } from "@/types/trips";

export const useAdminOrderDetail = (orderId?: string) => {
  const { orders, updateOrder } = useOrders();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const selectedOrder = orders.find((o) => o.id === orderId);
  const [freshOrder, setFreshOrder] = useState<Order | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);

  // Orden activa: usa la fresca de la API si existe, sino la de contexto local
  const currentOrder = freshOrder || selectedOrder;

  // Estados de actores (usuarios y conductores)
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Modales de acción
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [viewReceiptModalVisible, setViewReceiptModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // 1. Cargar datos frescos de la orden
  const fetchFreshOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getOrderDetail(orderId);
      if (response?.success && response?.order) {
        setFreshOrder(response.order);
      }
    } catch (error) {
      console.error("Error al cargar orden fresca:", error);
    }
  }, [orderId]);

  // 2. Cargar datos del viaje asociado a la orden
  const fetchTripDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getTripByOrderId(orderId);
      if (response?.success && response?.trip) {
        setTrip(response.trip);
      }
    } catch (error) {
      console.error("Error al cargar viaje asociado:", error);
    }
  }, [orderId]);

  // 4. Cargar conductores disponibles y viajes activos
  const fetchDriversAndTrips = useCallback(async () => {
    try {
      const [driversRes, tripsRes] = await Promise.all([
        getUsers({ userType: "driver" }),
        getAllTrips(),
      ]);
      if (driversRes.success && driversRes.users) {
        setDrivers(driversRes.users);
      }
      if (tripsRes?.success && tripsRes?.trips) {
        setAllTrips(tripsRes.trips);
      }
    } catch (error) {
      console.error("Error al obtener conductores o viajes:", error);
    }
  }, []);

  // Refrescar automáticamente al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchFreshOrder();
        fetchTripDetails();
        fetchDriversAndTrips();
      }
    }, [orderId, fetchFreshOrder, fetchTripDetails, fetchDriversAndTrips])
  );

  // 3. Cargar clientes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers({ userType: "client" });
        if (response.success && response.users) {
          setUsers(response.users);
        } else {
          showAlert({
            message: "No se pudieron cargar los usuarios.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        showAlert({
          message: "Error de red al cargar usuarios.",
          type: "error",
        });
      }
    };
    fetchUsers();
  }, [showAlert]);

  useEffect(() => {
    fetchDriversAndTrips();
  }, [fetchDriversAndTrips]);

  // 5. Acción: Aprobar orden (con o sin conductor asignado)
  const approveOrder = async () => {
    const targetId = currentOrder?.id;
    if (!targetId) return;

    try {
      show();
      const response = await approveOrderService(
        targetId,
        selectedDriverId || undefined
      );

      if (response.success) {
        updateOrder(targetId, { status: "approved" });
        setFreshOrder((prev) => (prev ? { ...prev, status: "approved" } : null));
        await Promise.all([fetchTripDetails(), fetchDriversAndTrips()]);
        showAlert({
          message: selectedDriverId
            ? "Orden aprobada y asignada al conductor correctamente."
            : "Orden aprobada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo aprobar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al aprobar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  // 6. Acción: Rechazar orden con motivo
  const rejectOrder = async () => {
    const targetId = currentOrder?.id;
    if (!targetId) return;

    if (!declineReason || declineReason.trim() === "") {
      setRejectModalVisible(false);
      showAlert({
        message: "Debe escribir un motivo para rechazar la orden.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      const response = await rejectOrderService(targetId, declineReason);
      if (response.success) {
         updateOrder(targetId, {
          status: "rejected",
          declineReason: declineReason,
          rejectionReason: declineReason,
        });
        setFreshOrder((prev) =>
          prev ? { ...prev, status: "rejected", declineReason, rejectionReason: declineReason } : null
        );
        setRejectModalVisible(false);
        setDeclineReason("");
        showAlert({
          message: "Orden rechazada correctamente.",
          type: "success",
        });
      } else {
        showAlert({ message: "No se pudo rechazar la orden.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al rechazar la orden.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  // 7. Cálculos de viajes simultáneos y pendientes
  const orderTrips = allTrips.filter(
    (t) => t.orderIds?.includes(currentOrder?.id || "") && String(t.status || "").toLowerCase() !== "canceled"
  );
  const activeTrips = orderTrips.filter((t) =>
    ["available", "assigned", "accepted", "started", "in_progress"].includes(String(t.status || "").toLowerCase())
  );
  const tonsInTransit = activeTrips.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const alreadyDelivered = Number(currentOrder?.deliveredTons) || 0;
  const orderTotalTons = Number(currentOrder?.totalTons || currentOrder?.pendingBalance) || 0;
  const availableToDispatch = Math.max(0, orderTotalTons - alreadyDelivered - tonsInTransit);

  const [isDispatching, setIsDispatching] = useState(false);

  // 8. Acción: Programar viaje siguiente / simultáneo
  const dispatchNextTrip = async (tonsToDispatch?: number, driverId?: string) => {
    const finalTons = tonsToDispatch && tonsToDispatch > 0 ? tonsToDispatch : availableToDispatch;
    if (!currentOrder?.id || finalTons <= 0) return;

    try {
      setIsDispatching(true);
      show();
      const nextTripNumber = `TRIP-${currentOrder.orderNumber || currentOrder.id.slice(0, 5).toUpperCase()}-${orderTrips.length + 1}`;
      const chosenDriver =
        driverId && driverId.trim() !== "" ? driverId.trim() : undefined;
      const response = await createTrip(
        nextTripNumber,
        [currentOrder.id],
        "Despacho programado por administración",
        finalTons,
        chosenDriver
      );

      if (response?.success) {
        showAlert({
          message: `Viaje ${nextTripNumber} creado exitosamente (${finalTons.toFixed(2)} t).`,
          type: "success",
        });
        setSelectedDriverId("");
        const tripsRes = await getAllTrips();
        if (tripsRes?.success && tripsRes?.trips) {
          setAllTrips(tripsRes.trips);
        }
        fetchTripDetails();
        fetchFreshOrder();
      } else {
        showAlert({
          message: response?.message || "No se pudo crear el viaje.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error("Error al despachar siguiente viaje:", err);
      showAlert({
        message: err?.message || "Error al programar el viaje.",
        type: "error",
      });
    } finally {
      setIsDispatching(false);
      hide();
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchFreshOrder(),
      fetchTripDetails(),
      fetchDriversAndTrips(),
    ]);
  }, [fetchFreshOrder, fetchTripDetails, fetchDriversAndTrips]);

  return {
    currentOrder,
    trip,
    users,
    drivers,
    allTrips,
    orderTrips,
    availableToDispatch,
    dispatchNextTrip,
    isDispatching,
    selectedDriverId,
    setSelectedDriverId,
    rejectModalVisible,
    setRejectModalVisible,
    viewReceiptModalVisible,
    setViewReceiptModalVisible,
    declineReason,
    setDeclineReason,
    approveOrder,
    rejectOrder,
    fetchFreshOrder,
    fetchTripDetails,
    fetchDriversAndTrips,
    refreshAll,
    setFreshOrder,
    updateOrder: (updated: Partial<Order>) => {
      if (currentOrder?.id) {
        updateOrder(currentOrder.id, updated);
      }
    },
  };
};
