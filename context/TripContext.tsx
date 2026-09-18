import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./authContext";

import { Address } from "@/types/users";
export type { Address };

// Tipos para los detalles del viaje aceptado
export type Delivery = {
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  status: string;
  imageUrl: string; // ✅ Propiedad corregida a 'images' con un array de objetos
};

export type Item = {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  orderNumber: number;
  userId: string;
  deliveryType: string;
  deliveries: Delivery[];
  items: Item[];
  comments: string;
  status: string;
  createdAt: string;
  userNames: string;
  userLastNames: string;
  userPhone: string;
};

export type AcceptedTrip = {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  createdAt: string;
  assignedDriverId: string;
  status: string;
  orders: Order[];
  userNames: string;
  userLastNames: string;
  userPhone: string;
  driver?: any;
};

// Estado del contexto
type AcceptedTripState = {
  trip: AcceptedTrip | null;
  saveTrip: (trip: AcceptedTrip) => void;
  clearTrip: () => void;
};

// Storage key
const acceptedTripStorageKey = "accepted-trip-key";

// Context base
export const AcceptedTripContext = createContext<AcceptedTripState>({
  trip: null,
  saveTrip: () => {},
  clearTrip: () => {},
});

// Provider
export const AcceptedTripProvider = ({ children }: PropsWithChildren) => {
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState<AcceptedTrip | null>(null);

  const getStorageKey = (uid?: string) =>
    uid ? `accepted-trip-${uid}` : "accepted-trip-key";

  useEffect(() => {
    const loadTrip = async () => {
      if (!user?.uid) {
        setTrip(null);
        return;
      }
      try {
        const userKey = getStorageKey(user.uid);
        let value = await AsyncStorage.getItem(userKey);

        if (!value) {
          const globalValue = await AsyncStorage.getItem(acceptedTripStorageKey);
          if (globalValue) {
            const parsedGlobal = JSON.parse(globalValue);
            if (
              parsedGlobal &&
              (parsedGlobal.assignedDriverId === user.uid ||
                parsedGlobal.driverId === user.uid)
            ) {
              value = globalValue;
            } else {
              await AsyncStorage.removeItem(acceptedTripStorageKey);
            }
          }
        }

        if (value) {
          const parsed = JSON.parse(value);
          if (
            parsed &&
            (parsed.assignedDriverId === user.uid ||
              parsed.driverId === user.uid ||
              parsed.driver?.id === user.uid)
          ) {
            setTrip(parsed);
          } else {
            setTrip(null);
            await AsyncStorage.removeItem(userKey);
          }
        } else {
          setTrip(null);
        }
      } catch (error) {
        console.error("❌ Error cargando el viaje aceptado:", error);
      }
    };
    loadTrip();
  }, [user?.uid]);

  const saveTrip = async (newTrip: AcceptedTrip) => {
    try {
      setTrip(newTrip);
      const key = getStorageKey(user?.uid);
      await AsyncStorage.setItem(key, JSON.stringify(newTrip));
    } catch (error) {
      console.error("❌ Error guardando el viaje aceptado:", error);
    }
  };

  const clearTrip = async () => {
    try {
      setTrip(null);
      const key = getStorageKey(user?.uid);
      await AsyncStorage.removeItem(key);
      await AsyncStorage.removeItem(acceptedTripStorageKey);
    } catch (error) {
      console.error("❌ Error limpiando el viaje aceptado:", error);
    }
  };

  return (
    <AcceptedTripContext.Provider
      value={{
        trip,
        saveTrip,
        clearTrip,
      }}
    >
      {children}
    </AcceptedTripContext.Provider>
  );
};
