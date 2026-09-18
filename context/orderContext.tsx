import React, { createContext, useContext, useState } from "react";
import { Order } from "@/types/orders";
export type { Order };

type OrdersContextType = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, setOrders, updateOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used inside OrdersProvider");
  return context;
};
