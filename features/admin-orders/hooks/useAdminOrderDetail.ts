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
import { getTripByOrderId } from "@/services/tripsService";
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

  // Refrescar automáticamente al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchFreshOrder();
        fetchTripDetails();
      }
    }, [orderId, fetchFreshOrder, fetchTripDetails])
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

  // 4. Cargar conductores disponibles
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await getUsers({ userType: "driver" });
        if (response.success && response.users) {
          setDrivers(response.users);
        }
      } catch (error) {
        console.error("Error al obtener conductores:", error);
      }
    };
    fetchDrivers();
  }, []);

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
        fetchTripDetails();
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

  return {
    currentOrder,
    trip,
    users,
    drivers,
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
    setFreshOrder,
    updateOrder: (updated: Partial<Order>) => {
      if (currentOrder?.id) {
        updateOrder(currentOrder.id, updated);
      }
    },
  };
};
