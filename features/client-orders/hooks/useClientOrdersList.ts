import React, { useCallback, useContext, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { OrderFilterType } from "@/components/orders/OrderFilterChips";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { CartContext, Product } from "@/context/cartContext";
import { useOrders } from "@/context/orderContext";
import { getMyOrders } from "@/services/orderService";

export const useClientOrdersList = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { orders, setOrders } = useOrders();
  const { showAlert } = useAlert();
  const lastFetchedAtRef = React.useRef<number>(0);
  const isFetchingRef = React.useRef<boolean>(false);

  const fetchOrders = useCallback(async (isPullToRefresh = false) => {
    if (isFetchingRef.current) return;

    const now = Date.now();
    if (!isPullToRefresh && orders.length > 0 && now - lastFetchedAtRef.current < 15_000) {
      return;
    }

    try {
      isFetchingRef.current = true;
      if (isPullToRefresh) setRefreshing(true);
      const response = await getMyOrders();
      if (response && response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders);
        lastFetchedAtRef.current = Date.now();
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert({
        message: "Error al cargar las órdenes. Por favor, inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      isFetchingRef.current = false;
      if (isPullToRefresh) setRefreshing(false);
    }
  }, [orders.length, setOrders, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders(false);
    }, [fetchOrders])
  );

  const counts: Record<OrderFilterType, number> = useMemo(() => {
    const res: Record<OrderFilterType, number> = {
      all: orders.length,
      approved: 0,
      on_the_way: 0,
      pending: 0,
      delivered: 0,
      canceled: 0,
    };
    orders.forEach((o) => {
      const st = (o.status || "").toLowerCase().trim();
      if (st === "approved") res.approved++;
      else if (st === "pending") res.pending++;
      else if (st === "on_the_way" || st === "in_progress") res.on_the_way++;
      else if (st === "delivered" || st === "completed") res.delivered++;
      else if (st === "canceled" || st === "cancelled" || st === "rejected") res.canceled++;
    });
    return res;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const st = (order.status || "").toLowerCase().trim();
      if (activeFilter === "approved" && st !== "approved") return false;
      if (activeFilter === "on_the_way" && st !== "on_the_way" && st !== "in_progress") return false;
      if (activeFilter === "pending" && st !== "pending") return false;
      if (activeFilter === "delivered" && st !== "delivered" && st !== "completed") return false;
      if (activeFilter === "canceled" && st !== "canceled" && st !== "cancelled" && st !== "rejected") return false;

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const orderNumStr = String(order.orderNumber ?? "").toLowerCase();
        const fullOrderStr = `${ORDER_PREFIX.ORD}${orderNumStr}`.toLowerCase();
        const hasProductMatch = order.items?.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        const hasNumMatch = orderNumStr.includes(query) || fullOrderStr.includes(query);
        const hasDateMatch = new Date(order.createdAt).toLocaleDateString().includes(query);

        if (!hasNumMatch && !hasProductMatch && !hasDateMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeFilter, search]);

  const { cart, setCartItems, addToCart } = useContext(CartContext);

  const goToOrderDetail = (id: string) => {
    router.push({
      pathname: "/client-order-detail",
      params: { orderId: id },
    });
  };

  const handleQuickReorder = (order: any) => {
    if (!order?.items || order.items.length === 0) return;

    const formattedProducts: Product[] = order.items.map((item: any) => {
      const qty = Number(item.quantity) || 100;
      const unitPrice =
        Number(item.unitPrice) ||
        Number(item.price) ||
        (item.subtotal ? Math.round(Number(item.subtotal) / qty) : 480);

      return {
        id: item.productId || item.id || `prod-${Math.random()}`,
        name: item.name,
        price: unitPrice,
        fundas: qty,
      };
    });

    const executeReorder = (replace: boolean) => {
      if (replace) {
        setCartItems(formattedProducts);
      } else {
        formattedProducts.forEach((p: Product) => addToCart(p));
      }
      router.push("/client-cart");
    };

    if (cart.length > 0) {
      Alert.alert(
        "Carrito con productos",
        "Ya tienes materiales en tu carrito. ¿Deseas reemplazar el carrito con los productos de este pedido o sumarlos?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sumar al carrito", onPress: () => executeReorder(false) },
          { text: "Reemplazar carrito", style: "destructive", onPress: () => executeReorder(true) },
        ]
      );
    } else {
      executeReorder(true);
    }
  };

  return {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    refreshing,
    counts,
    filteredOrders,
    fetchOrders,
    goToOrderDetail,
    handleQuickReorder,
  };
};
