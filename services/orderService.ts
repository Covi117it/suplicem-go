import AsyncStorage from "@react-native-async-storage/async-storage";
import { Address } from "@/types/users";
import api from "./api";
import { safeRequest } from "./apiSafe";
import protectedApi from "./protectedApi";

export const getOrderTracking = async (orderId: string) => {
  return await safeRequest(() => protectedApi.get(`/orders/${orderId}/tracking`));
};

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  reason?: string
) => {
  const response = await api.put(`/orders/${id}/status`, { status, reason });
  return response.data;
};

export const getMyOrders = async (params?: { search?: string; status?: string }) => {
  const response = await protectedApi.get("/orders/my", { params });
  return response.data;
};

export const getOrderDetail = async (id: string) => {
  const response = await protectedApi.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (order: {
  deliveryType: string;
  deliveries?: {
    productId: string;
    address?: Address;
    quantity: number;
    unit?: string;
  }[];
  items: {
    productId: string;
    quantity: number;
    name?: string;
    unit?: string;
    unitPrice?: number;
    subtotal?: number;
  }[];
  comments?: string;
  receiptImage?: string;
}) => {
  const response = await protectedApi.post("/orders", order);
  return response.data;
};

export const orderDelivered = async (id: string, index: number) => {
  const response = await protectedApi.patch(`orders/${id}/deliveries/${index}`);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await protectedApi.get("/orders");
  return response.data;
};

export const getOrdersWithStatus = async (status: string) => {
  const response = await protectedApi.get("/orders", {
    params: { status },
  });
  return response.data;
};
export const approveOrder = async (id: string) => {
  const response = await protectedApi.patch(`/orders/${id}/status`, {
    status: "approved",
  });
  return response.data;
};

export const rejectedOrder = async (id: string, reason: string) => {
  const response = await protectedApi.patch(`/orders/${id}/status`, {
    status: "rejected",
    reason: reason,
  });
  return response.data;
};

export const markAsDelivered = async (
  orderId: string,
  imageUri: string,
  comment: string,
  deliveryIndex: number
) => {
  try {
    const formData = new FormData();

    const file: any = {
      uri: imageUri,
      name: "delivery-photo.jpg",
      type: "image/jpeg",
    };

    formData.append("image", file);
    formData.append("comment", comment);

    console.log("📦 Enviando FormData:");
    console.log(formData);

    const url = `/orders/${orderId}/deliveries/${deliveryIndex}/attachment`;

    const response = await protectedApi.patch(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error en markAsDelivered:", error);
    return {
      success: false,
      message: "Error al marcar la entrega.",
      data: null,
    };
  }
};

export const completeDeliveryWithProof = async (
  orderId: string,
  deliveryIndex: number,
  imageUri: string,
  comment?: string
) => {
  try {
    const formData = new FormData();

    const file: any = {
      uri: imageUri,
      name: "delivery-photo.jpg",
      type: "image/jpeg",
    };

    formData.append("image", file);
    if (comment) {
      formData.append("comment", comment);
    }

    const response = await protectedApi.post(
      `/orders/${orderId}/deliveries/${deliveryIndex}/complete`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error en completeDeliveryWithProof:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Error al completar la entrega.",
    };
  }
};

const OFFLINE_DELIVERY_KEY = "@suplicem_offline_deliveries";

export interface OfflineDeliveryItem {
  id: string;
  orderId: string;
  deliveryIndex: number;
  createdAt: number;
}

export async function getPendingOfflineDeliveries(): Promise<OfflineDeliveryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_DELIVERY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("❌ Error leyendo cola offline:", error);
    return [];
  }
}

export async function enqueueOfflineDelivery(
  orderId: string,
  deliveryIndex: number
): Promise<OfflineDeliveryItem> {
  const current = await getPendingOfflineDeliveries();
  const newItem: OfflineDeliveryItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderId,
    deliveryIndex,
    createdAt: Date.now(),
  };

  const updated = [...current, newItem];
  await AsyncStorage.setItem(OFFLINE_DELIVERY_KEY, JSON.stringify(updated));
  console.log(`💾 Entrega de orden ${orderId} guardada en cola local (Offline).`);
  return newItem;
}

export async function removeOfflineDelivery(id: string): Promise<void> {
  try {
    const current = await getPendingOfflineDeliveries();
    const filtered = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(OFFLINE_DELIVERY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("❌ Error eliminando entrega de cola offline:", error);
  }
}

export async function syncPendingDeliveries(): Promise<{
  total: number;
  synced: number;
  failed: number;
}> {
  const pending = await getPendingOfflineDeliveries();
  if (pending.length === 0) {
    return { total: 0, synced: 0, failed: 0 };
  }

  console.log(`🔄 Sincronizando ${pending.length} entregas offline pendientes...`);
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const response = await orderDelivered(item.orderId, item.deliveryIndex);
      if (response?.success) {
        await removeOfflineDelivery(item.id);
        synced++;
        console.log(`✅ Entrega offline sincronizada: Orden ${item.orderId}, parada ${item.deliveryIndex}`);
      } else {
        failed++;
      }
    } catch (err: any) {
      failed++;
      console.warn(`⚠️ Aún sin conexión para sincronizar entrega ${item.id}:`, err?.message);
    }
  }

  return { total: pending.length, synced, failed };
}

