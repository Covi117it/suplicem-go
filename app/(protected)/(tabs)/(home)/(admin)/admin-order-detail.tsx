import React from "react";
import { useLocalSearchParams } from "expo-router";
import { AdminOrderDetailScreen } from "@/features/admin-orders/AdminOrderDetailScreen";

export default function AdminOrderDetailRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  return <AdminOrderDetailScreen orderId={orderId} />;
}
