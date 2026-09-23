import React from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

interface TripExecutionModalsProps {
  isCancelModalVisible: boolean;
  isDeliveryModalVisible: boolean;
  onConfirmCancel: () => void;
  onCloseCancel: () => void;
  onConfirmDelivery: () => void;
  onCloseDelivery: () => void;
}

export const TripExecutionModals: React.FC<TripExecutionModalsProps> = ({
  isCancelModalVisible,
  isDeliveryModalVisible,
  onConfirmCancel,
  onCloseCancel,
  onConfirmDelivery,
  onCloseDelivery,
}) => {
  return (
    <>
      <ConfirmationModal
        visible={isCancelModalVisible}
        title="Cancelar viaje"
        message="¿Estás seguro de que deseas cancelar este viaje?"
        onConfirm={onConfirmCancel}
        onCancel={onCloseCancel}
        confirmText="Sí, cancelar"
        cancelText="No, volver"
      />

      <ConfirmationModal
        visible={isDeliveryModalVisible}
        title="Confirmar Entrega"
        message="¿Confirmas que este pedido fue entregado en el destino?"
        onConfirm={onConfirmDelivery}
        onCancel={onCloseDelivery}
        confirmText="Sí, entregar"
        cancelText="Cancelar"
      />
    </>
  );
};
