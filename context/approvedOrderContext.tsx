import React, { createContext, useContext, useMemo, useState } from "react";
import { Order } from "@/types/orders";
import { useOrders } from "./orderContext";

export type ApprovedOrder = Order;

type ApprovedOrdersContextType = {
  approvedOrders: Order[];
  setApprovedOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  selectedApprovedOrder: Order | null;
  setSelectedApprovedOrder: React.Dispatch<React.SetStateAction<Order | null>>;
};

const ApprovedOrdersContext = createContext<ApprovedOrdersContextType | undefined>(undefined);

export const ApprovedOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orders } = useOrders();
  const [selectedApprovedOrder, setSelectedApprovedOrder] = useState<Order | null>(null);

  // Deriva automáticamente las órdenes aprobadas directamente desde OrdersContext sin duplicar estado en memoria
  const approvedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "approved");
  }, [orders]);

  // No-op para mantener retrocompatibilidad con pantallas que llamaban setApprovedOrders manualmente
  const setApprovedOrders = () => {};

  return (
    <ApprovedOrdersContext.Provider
      value={{
        approvedOrders,
        setApprovedOrders,
        selectedApprovedOrder,
        setSelectedApprovedOrder,
      }}
    >
      {children}
    </ApprovedOrdersContext.Provider>
  );
};

export const useApprovedOrders = () => {
  const context = useContext(ApprovedOrdersContext);
  if (!context) throw new Error("useApprovedOrders must be used inside ApprovedOrdersProvider");
  return context;
};
