import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useOrders } from "@/context/orderContext";
import { getAllOrders } from "@/services/orderService";
import { OrderStatus } from "@/types/orders";
import { FilterOption } from "@/components/FilterChips";

export type AdminOrderStatusFilter = OrderStatus | "Todos" | "Alertas IA";

export const ORDER_FILTER_OPTIONS: FilterOption<string>[] = [
  { id: "Todos", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "Alertas IA", label: "⚠️ Alertas IA" },
  { id: "approved", label: "Aprobadas" },
  { id: "on_the_way", label: "En camino" },
  { id: "completed", label: "Entregadas" },
  { id: "rejected", label: "Rechazadas" },
];

export const useAdminOrdersMain = () => {
  const { orders, setOrders } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter>("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: orders.length,
      "Alertas IA": orders.filter((o: any) => o.aiRiskFlag === true).length,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getAllOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);
      } else {
        showAlert({
          message: "No se pudieron cargar las órdenes.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al obtener las órdenes.",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [setOrders, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleViewDetails = useCallback(
    (orderId: string) => {
      router.push({
        pathname: "/admin-order-detail",
        params: { orderId },
      });
    },
    [router]
  );

  const sortedOrders = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const searchWords = searchLower.split(/\s+/).filter(Boolean);

    const filtered = orders.filter((order) => {
      const fullName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim().toLowerCase();
      const orderNum = String(order.orderNumber || "").toLowerCase();
      const fullOrderNum = `ord-${orderNum}`.toLowerCase();
      const phone = String(order.userPhone || "").toLowerCase();
      const userId = String(order.userId || "").toLowerCase();

      const matchesSearch =
        searchWords.length === 0 ||
        fullName.includes(searchLower) ||
        orderNum.includes(searchLower) ||
        fullOrderNum.includes(searchLower) ||
        phone.includes(searchLower) ||
        userId.includes(searchLower) ||
        searchWords.every((word) =>
          fullName.includes(word) ||
          orderNum.includes(word) ||
          phone.includes(word)
        );

      const matchesStatus =
        statusFilter === "Todos"
          ? true
          : statusFilter === "Alertas IA"
          ? (order as any).aiRiskFlag === true
          : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;

      const orderA = parseInt(String(a.orderNumber), 10);
      const orderB = parseInt(String(b.orderNumber), 10);
      return orderB - orderA;
    });
  }, [orders, search, statusFilter]);

  return {
    orders,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refreshing,
    fetchOrders,
    orderCounts,
    sortedOrders,
    handleViewDetails,
  };
};
