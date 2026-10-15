import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";
import { Order } from "@/types/orders";
import { DriverSelectionModal } from "./DriverSelectionModal";

export interface PlannedTripItem {
  totalTons: number;
  driverId: string;
  comments?: string;
}

interface OrderTripPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order;
  totalAvailableTons: number;
  drivers: User[];
  allTrips: Trip[];
  existingOrderTrips?: Trip[];
  onConfirmPlan: (trips: PlannedTripItem[]) => void;
  isSaving?: boolean;
  title?: string;
  isSingleTripSplit?: boolean;
  initialDriverId?: string;
}

const EMPTY_TRIPS: Trip[] = [];

export const OrderTripPlannerModal: React.FC<OrderTripPlannerModalProps> = ({
  visible,
  onClose,
  order,
  totalAvailableTons,
  drivers,
  allTrips,
  existingOrderTrips = EMPTY_TRIPS,
  onConfirmPlan,
  isSaving = false,
  title,
  isSingleTripSplit = false,
  initialDriverId,
}) => {
  const isAllCement =
    (order.items || []).length > 0 &&
    (order.items || []).every(
      (item: any) =>
        item.unit === "fundas" && (item.name || "").toLowerCase().includes("cemento")
    );

  const totalBagsInOrder = (order.items || []).reduce((sum: number, item: any) => {
    const isCement = item.unit === "fundas" || !item.unit || item.name?.toLowerCase().includes("cemento");
    return sum + (isCement ? (Number(item.quantity) || 0) : 0);
  }, 0);

  const orderTotalTons = totalAvailableTons > 0 ? totalAvailableTons : (Number(order.totalTons || order.pendingBalance) || 0);
  const avgFactor = totalBagsInOrder > 0 && orderTotalTons > 0 && isAllCement ? orderTotalTons / totalBagsInOrder : 0.0425;
  const tonsToBags = (t: number) => Math.round(t / avgFactor);

  const minTrips = isSingleTripSplit ? 2 : 1;
  const maxTrips = Math.min(25, Math.max(6, Math.ceil(orderTotalTons / 15)));
  const [tripCount, setTripCount] = useState<number>(isSingleTripSplit ? 2 : (orderTotalTons > 25 ? 2 : 1));
  const [trips, setTrips] = useState<PlannedTripItem[]>([]);
  const [activeDriverPickerIndex, setActiveDriverPickerIndex] = useState<number | null>(null);

  // Inicializar o cargar los viajes existentes solo cuando se abre el modal
  useEffect(() => {
    if (!visible || orderTotalTons <= 0) return;

    if (existingOrderTrips && existingOrderTrips.length > 0 && !isSingleTripSplit) {
      setTripCount(existingOrderTrips.length);
      setTrips(
        existingOrderTrips.map((t) => ({
          totalTons: Number(t.totalTons) || Number((orderTotalTons / existingOrderTrips.length).toFixed(2)),
          driverId: t.assignedDriverId || t.driverId || "",
          comments: t.comments,
        }))
      );
    } else {
      const initialCount = isSingleTripSplit ? 2 : (orderTotalTons > 25 ? 2 : 1);
      setTripCount(initialCount);
      const tonsPerTrip = Number((orderTotalTons / initialCount).toFixed(2));
      const newTrips: PlannedTripItem[] = [];
      let allocated = 0;

      for (let i = 0; i < initialCount; i++) {
        const tons = i === initialCount - 1 ? Number((orderTotalTons - allocated).toFixed(2)) : tonsPerTrip;
        allocated += tons;
        newTrips.push({
          totalTons: tons,
          driverId: i === 0 && initialDriverId ? initialDriverId : "",
        });
      }
      setTrips(newTrips);
    }
  }, [visible]);

  const recalculateTrips = (count: number, total: number) => {
    const tonsPerTrip = Number((total / count).toFixed(2));
    const newTrips: PlannedTripItem[] = [];
    let allocated = 0;

    for (let i = 0; i < count; i++) {
      const tons = i === count - 1 ? Number((total - allocated).toFixed(2)) : tonsPerTrip;
      allocated += tons;
      // Preservar el conductor existente si ya estaba en esa posición o el inicial
      const existingDriver =
        trips[i]?.driverId ||
        (i === 0 && initialDriverId ? initialDriverId : "") ||
        existingOrderTrips[i]?.assignedDriverId ||
        existingOrderTrips[i]?.driverId ||
        "";
      newTrips.push({
        totalTons: tons,
        driverId: existingDriver,
      });
    }
    setTrips(newTrips);
  };


  const handleTripCountChange = (newCount: number) => {
    if (newCount < minTrips || newCount > maxTrips) return;
    setTripCount(newCount);
    recalculateTrips(newCount, orderTotalTons);
  };

  const handleUpdateTripTons = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], totalTons: num };
      return copy;
    });
  };

  const handleSelectDriverForTrip = (driverId: string) => {
    if (activeDriverPickerIndex !== null) {
      setTrips((prev) => {
        const copy = [...prev];
        copy[activeDriverPickerIndex] = {
          ...copy[activeDriverPickerIndex],
          driverId,
        };
        return copy;
      });
      setActiveDriverPickerIndex(null);
    }
  };

  const sumTons = trips.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const isDiffSignificant = Math.abs(sumTons - orderTotalTons) > 0.05;

  const handleConfirm = () => {
    if (trips.some((t) => t.totalTons <= 0)) {
      Alert.alert("Error", "Todos los viajes deben tener un tonelaje mayor a 0.");
      return;
    }
    if (isDiffSignificant) {
      Alert.alert(
        "Ajuste de Carga",
        `La suma de los viajes (${sumTons.toFixed(2)} t) no coincide con el total a transportar (${orderTotalTons.toFixed(2)} t).`
      );
      return;
    }
    onConfirmPlan(trips);
  };

  const activeTripForDriverPicker = activeDriverPickerIndex !== null ? trips[activeDriverPickerIndex] : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title || "Planificar y Fraccionar Viajes"}</Text>
              <Text style={styles.subtitle}>
                Total: {orderTotalTons.toFixed(2)} t{isAllCement ? ` (${tonsToBags(orderTotalTons).toLocaleString()} fundas)` : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Selector de número de viajes */}
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>Número de viajes / camiones:</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={[styles.counterBtn, tripCount <= minTrips && styles.counterBtnDisabled]}
                onPress={() => handleTripCountChange(tripCount - 1)}
                disabled={tripCount <= minTrips || isSaving}
              >
                <Ionicons name="remove" size={18} color={tripCount <= minTrips ? "#94A3B8" : "#0F294A"} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{tripCount}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, tripCount >= maxTrips && styles.counterBtnDisabled]}
                onPress={() => handleTripCountChange(tripCount + 1)}
                disabled={tripCount >= maxTrips || isSaving}
              >
                <Ionicons name="add" size={18} color={tripCount >= maxTrips ? "#94A3B8" : "#0F294A"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de viajes a planificar */}
          <ScrollView style={styles.tripsList} showsVerticalScrollIndicator={false}>
            {trips.map((item, idx) => {
              const assignedDriver = drivers.find((d) => d.uid === item.driverId);
              const driverCap = Number(assignedDriver?.vehicle?.tons) || 0;
              const isOverCap = driverCap > 0 && item.totalTons > driverCap;

              return (
                <View key={idx} style={styles.tripCard}>
                  <View style={styles.tripCardHeader}>
                    <Text style={styles.tripCardTitle}>Viaje #{idx + 1}</Text>
                    {isAllCement && (
                      <Text style={styles.tripBagsText}>
                        ~{tonsToBags(item.totalTons).toLocaleString()} fundas
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputRow}>
                    <Text style={styles.fieldLabel}>Toneladas:</Text>
                    <TextInput
                      style={styles.tonInput}
                      keyboardType="numeric"
                      value={item.totalTons.toString()}
                      onChangeText={(val) => handleUpdateTripTons(idx, val)}
                    />
                    <Text style={styles.unitSuffix}>t</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.driverBtn}
                    onPress={() => setActiveDriverPickerIndex(idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-outline" size={16} color="#0F294A" />
                    <Text style={styles.driverBtnText} numberOfLines={1}>
                      {assignedDriver
                        ? `[${assignedDriver.driverCode || "COND"}] ${assignedDriver.names} ${assignedDriver.lastNames} (${driverCap} t)`
                        : "🌐 Sin asignar (Bolsa General)"}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                  </TouchableOpacity>

                  {isOverCap && (
                    <Text style={styles.warnText}>
                      ⚠️ La carga supera la capacidad del camión ({driverCap} t).
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, isSaving && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={isSaving}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSaving ? "Guardando viajes..." : `Confirmar Planificación (${tripCount} Viajes)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de selección de conductor para el viaje específico */}
      {activeTripForDriverPicker && (
        <DriverSelectionModal
          visible={activeDriverPickerIndex !== null}
          onClose={() => setActiveDriverPickerIndex(null)}
          order={order}
          targetTons={activeTripForDriverPicker.totalTons}
          drivers={drivers}
          allTrips={allTrips}
          selectedDriverId={activeTripForDriverPicker.driverId}
          onSelectDriver={handleSelectDriverForTrip}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  subtitle: {
    fontSize: 13,
    color: "#C2410C",
    fontWeight: "600",
    marginTop: 2,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  counterControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    backgroundColor: "#E2E8F0",
    padding: 6,
    borderRadius: 6,
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  tripsList: {
    maxHeight: 320,
    marginBottom: 14,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  tripCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tripCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  tripBagsText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#475569",
    width: 80,
  },
  tonInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
    backgroundColor: "#F8FAFC",
  },
  unitSuffix: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "bold",
  },
  driverBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 6,
  },
  driverBtnText: {
    flex: 1,
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "500",
  },
  warnText: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 4,
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#166534",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
