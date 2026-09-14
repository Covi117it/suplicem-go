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

