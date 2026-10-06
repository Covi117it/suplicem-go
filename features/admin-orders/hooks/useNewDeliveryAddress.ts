import { useState } from "react";
import { useAlert } from "@/context/alertContext";
import { isValidCedula, isValidPassport } from "@/utils/validationUtils";

const generateTempPlaceId = () => `new-${Date.now()}`;

export const useNewDeliveryAddress = (
  onAddressCreated?: (address: any) => void,
  defaultClientData?: {
    recipientName?: string;
    recipientDocument?: string;
    recipientDocumentType?: string;
    userUid?: string;
  }
) => {
  const { showAlert } = useAlert();
  const getInitialAddressData = () => ({
    placeId: "",
    description: "",
    latitude: 0,
    longitude: 0,
    recipientName: defaultClientData?.recipientName || "",
    recipientDocument: defaultClientData?.recipientDocument || "",
    recipientDocumentType: defaultClientData?.recipientDocumentType || "Cédula",
    userUid: defaultClientData?.userUid || "",
    additionalInfo: "",
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState(getInitialAddressData);
  const resetForm = () => {
    setNewAddressData(getInitialAddressData());
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

    const lat = Number(newAddressData.latitude);
    const lng = Number(newAddressData.longitude);
    if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      showAlert({
        message:
          "La dirección no tiene coordenadas GPS válidas. Por favor, selecciona una sugerencia del buscador o marca el punto en el mapa.",
        type: "warning",
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
