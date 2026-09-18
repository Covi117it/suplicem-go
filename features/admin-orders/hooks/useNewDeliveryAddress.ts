import { useState } from "react";
import { useAlert } from "@/context/alertContext";
import { isValidCedula, isValidPassport } from "@/utils/validationUtils";

const generateTempPlaceId = () => `new-${Date.now()}`;

export const useNewDeliveryAddress = (
  onAddressCreated?: (address: any) => void
) => {
  const { showAlert } = useAlert();

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    placeId: "",
    description: "",
    latitude: 0,
    longitude: 0,
    recipientName: "",
    recipientDocument: "",
    recipientDocumentType: "Cédula",
    additionalInfo: "",
  });

  const resetForm = () => {
    setNewAddressData({
      placeId: "",
      description: "",
      latitude: 0,
      longitude: 0,
      recipientName: "",
      recipientDocument: "",
      recipientDocumentType: "Cédula",
      additionalInfo: "",
    });
    setIsAddingNewAddress(false);
  };

  const handleAddNewAddress = () => {
    if (!newAddressData.description || !newAddressData.placeId) {
      showAlert({
        message: "Por favor, selecciona una dirección.",
        type: "error",
      });
      return;
    }

    if (newAddressData.recipientDocument) {
      const isValid =
        newAddressData.recipientDocumentType === "Cédula"
          ? isValidCedula(newAddressData.recipientDocument)
          : isValidPassport(newAddressData.recipientDocument);

      if (!isValid) {
        showAlert({
          message: `El número de ${newAddressData.recipientDocumentType.toLowerCase()} ingresado no es válido.`,
          type: "error",
        });
        return;
      }
    }

    const newAddress = {
      ...newAddressData,
      placeId: newAddressData.placeId || `addr-${Date.now()}`,
    };

    if (onAddressCreated) {
      onAddressCreated(newAddress);
    }

    resetForm();
    showAlert({
      message: "Nueva dirección agregada correctamente.",
      type: "success",
    });
  };

  const documentTypeOptions = [
    { label: "Cédula", value: "Cédula" },
    { label: "Pasaporte", value: "Pasaporte" },
  ];

  return {
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleAddNewAddress,
    resetNewAddressForm: resetForm,
    documentTypeOptions,
  };
};
