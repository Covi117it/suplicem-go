import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";
import { Order } from "@/types/orders";
import { DriverSelectionModal } from "./DriverSelectionModal";
import { bagsToTons, tonsToBags } from "@/constants/cartConstants";

interface DispatchFractionalTripModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order;
  availableToDispatch: number;
  drivers: User[];
  allTrips: Trip[];
  onConfirm: (tons: number, driverId?: string) => void;
  isDispatching?: boolean;
}

export const DispatchFractionalTripModal: React.FC<DispatchFractionalTripModalProps> = ({
  visible,
  onClose,
  order,
  availableToDispatch,
  drivers,
  allTrips,
  onConfirm,
  isDispatching,
}) => {
  const totalBagsInOrder = (order.items || []).reduce((sum: number, item: any) => {
    const isCement = item.unit === "fundas" || !item.unit || item.name?.toLowerCase().includes("cemento");
    return sum + (isCement ? (Number(item.quantity) || 0) : 0);
  }, 0);

  const totalOrderTons = Number(order.totalTons || order.pendingBalance) || 0;
  const avgFactor = totalBagsInOrder > 0 && totalOrderTons > 0 ? totalOrderTons / totalBagsInOrder : 0.0425;

  const orderBagsToTons = (b: number) => Number((b * avgFactor).toFixed(2));
  const orderTonsToBags = (t: number) => Math.round(t / avgFactor);

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [driverModalVisible, setDriverModalVisible] = useState(false);
  const [tonsInput, setTonsInput] = useState<string>(availableToDispatch.toString());
  const [bagsInput, setBagsInput] = useState<string>(orderTonsToBags(availableToDispatch).toString());

  useEffect(() => {
    if (visible) {
      setTonsInput(availableToDispatch.toString());
      setBagsInput(orderTonsToBags(availableToDispatch).toString());
      setSelectedDriverId("");
    }
  }, [visible, availableToDispatch, avgFactor]);

  const handleTonsChange = (val: string) => {
    setTonsInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setBagsInput(orderTonsToBags(parsed).toString());
    } else {
      setBagsInput("");
    }
  };

  const handleBagsChange = (val: string) => {
    setBagsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setTonsInput(orderBagsToTons(parsed).toString());
    } else {
      setTonsInput("");
    }
  };

  const selectedDriver = drivers.find((d) => d.uid === selectedDriverId);
  const driverCapacity = Number(selectedDriver?.vehicle?.tons) || 0;
  const enteredTons = parseFloat(tonsInput) || 0;
  const isOverCapacity = driverCapacity > 0 && enteredTons > driverCapacity;
  const isOverRemaining = enteredTons > availableToDispatch;

  const handleConfirm = () => {
    if (enteredTons <= 0) {
      Alert.alert("Cantidad inválida", "Debes ingresar una cantidad mayor a 0 toneladas.");
      return;
    }
    if (isOverRemaining) {
      Alert.alert("Exceso de carga", `No puedes despachar más del saldo pendiente (${availableToDispatch.toFixed(2)} t).`);
      return;
    }
    onConfirm(enteredTons, selectedDriverId.trim() !== "" ? selectedDriverId : "");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Programar Viaje Fraccionado</Text>
            <TouchableOpacity onPress={onClose} disabled={isDispatching}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Desglose de tonelaje y fundas */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceSubLabel}>Total de la Orden:</Text>
              <Text style={styles.balanceSubValue}>
                {totalOrderTons.toFixed(2)} t ({totalBagsInOrder.toLocaleString()} fundas)
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Falta por programar:</Text>
              <Text style={styles.balanceValue}>
                {availableToDispatch.toFixed(2)} t ({orderTonsToBags(availableToDispatch).toLocaleString()} fundas)
              </Text>
            </View>
          </View>

          {/* Selector de cantidad dual: Toneladas y Fundas */}
          <Text style={styles.inputLabel}>Carga para este camión:</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldSubLabel}>Toneladas (t):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={tonsInput}
                onChangeText={handleTonsChange}
                placeholder="0.00"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldSubLabel}>Fundas:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={bagsInput}
                onChangeText={handleBagsChange}
                placeholder="0"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.maxButtonFull}
            onPress={() => {
              setTonsInput(availableToDispatch.toString());
              setBagsInput(orderTonsToBags(availableToDispatch).toString());
            }}
          >
            <Text style={styles.maxButtonText}>
              Cargar Todo el Remanente ({availableToDispatch.toFixed(2)} t • {orderTonsToBags(availableToDispatch).toLocaleString()} fundas)
            </Text>
          </TouchableOpacity>

          {/* Selección de Conductor para este viaje */}
          <Text style={styles.inputLabel}>Conductor asignado a este viaje:</Text>
          <TouchableOpacity
            style={styles.driverPickerButton}
            onPress={() => setDriverModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={18} color="#0F294A" />
            <Text style={styles.driverPickerText}>
              {selectedDriver
                ? `[${selectedDriver.driverCode || "COND"}] ${selectedDriver.names} ${selectedDriver.lastNames} (${driverCapacity.toFixed(2)} t)`
                : "🌐 Sin asignar (Bolsa general)"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </TouchableOpacity>

          {isOverCapacity && (
            <View style={styles.alertBox}>
              <Ionicons name="warning" size={16} color="#DC2626" />
              <Text style={styles.alertText}>
                La carga ({enteredTons.toFixed(2)} t) supera la capacidad del camión ({driverCapacity.toFixed(2)} t).
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, (isDispatching || enteredTons <= 0 || isOverRemaining) && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={isDispatching || enteredTons <= 0 || isOverRemaining}
            activeOpacity={0.8}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isDispatching ? "Creando viaje..." : `Despachar Viaje (${enteredTons.toFixed(2)} t • ${orderTonsToBags(enteredTons).toLocaleString()} fundas)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <DriverSelectionModal
        visible={driverModalVisible}
        onClose={() => setDriverModalVisible(false)}
        order={order}
        targetTons={availableToDispatch}
        drivers={drivers}
        allTrips={allTrips}
        selectedDriverId={selectedDriverId}
        onSelectDriver={setSelectedDriverId}
      />
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
  balanceCard: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceSubLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  balanceSubValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F294A",
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C2410C",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  fieldSubLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  maxButtonFull: {
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  maxButton: {
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  driverPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  driverPickerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F294A",
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#166534",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
