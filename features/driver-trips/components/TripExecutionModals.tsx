import React from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import CancelTripModal from "@/features/admin-trips/components/CancelTripModal";

interface TripExecutionModalsProps {
  isCancelModalVisible: boolean;
  isDeliveryModalVisible: boolean;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onConfirmCancel: () => void;
  onCloseCancel: () => void;
  onConfirmDelivery: () => void;
  onCloseDelivery: () => void;
  isSubmittingCancel?: boolean;
}

export const TripExecutionModals: React.FC<TripExecutionModalsProps> = ({
  isCancelModalVisible,
  isDeliveryModalVisible,
  cancelReason,
  onCancelReasonChange,
  onConfirmCancel,
  onCloseCancel,
  onConfirmDelivery,
  onCloseDelivery,
  isSubmittingCancel = false,
}) => {
  return (
    <>
      <CancelTripModal
        visible={isCancelModalVisible}
        reason={cancelReason}
        onReasonChange={onCancelReasonChange}
        onConfirm={onConfirmCancel}
        onCancel={onCloseCancel}
        isSubmitting={isSubmittingCancel}
        title="Cancelar Viaje en Curso"
        subtitle="Ingresa el motivo obligatorio por el cual no puedes completar la ruta (falla mecánica, neumático, etc.). Se notificará al Administrador."
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
