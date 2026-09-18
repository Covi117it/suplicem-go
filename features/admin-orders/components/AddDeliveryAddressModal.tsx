import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";

interface AddDeliveryAddressModalProps {
  visible: boolean;
  newAddressData: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
    recipientName: string;
    recipientDocument: string;
    recipientDocumentType: string;
    additionalInfo: string;
  };
  setNewAddressData: React.Dispatch<React.SetStateAction<any>>;
  documentTypeOptions: { label: string; value: string }[];
  onSave: () => void;
  onCancel: () => void;
}

export const AddDeliveryAddressModal: React.FC<AddDeliveryAddressModalProps> = ({
  visible,
  newAddressData,
  setNewAddressData,
  documentTypeOptions,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Dirección</Text>

            <Text style={styles.label}>Dirección</Text>
            <AddressPicker
              initialValue={newAddressData.description || ""}
              onPlaceSelected={(place) => {
                setNewAddressData((prevData: any) => ({
                  ...prevData,
                  placeId: place.placeId,
                  description: place.description,
                  latitude: place.latitude,
                  longitude: place.longitude,
                }));
              }}
            />
            {newAddressData.description !== "" && (
              <View style={styles.selectedAddressContainer}>
                <Text style={styles.selectedAddressText}>
                  {newAddressData.description}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Información adicional</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Apto 3B, cerca del parque"
              placeholderTextColor="#999"
              value={newAddressData.additionalInfo}
              onChangeText={(text) =>
                setNewAddressData((prev: any) => ({
                  ...prev,
                  additionalInfo: text,
                }))
              }
            />

            <Text style={styles.label}>Nombre de quien recibe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={newAddressData.recipientName}
              onChangeText={(text) =>
                setNewAddressData((prev: any) => ({
                  ...prev,
                  recipientName: text,
                }))
              }
            />

            <Text style={styles.label}>Tipo de documento</Text>
            <CustomPickerModal
              label="Seleccionar tipo de documento"
              selectedValue={newAddressData.recipientDocumentType}
              onValueChange={(value) =>
                setNewAddressData((prev: any) => ({
                  ...prev,
                  recipientDocumentType: value,
                }))
              }
              options={documentTypeOptions}
            />

            <Text style={styles.label}>Número de documento</Text>
            <TextInput
              style={styles.input}
              maxLength={
                newAddressData.recipientDocumentType === "Cédula" ? 11 : 12
              }
              keyboardType={
                newAddressData.recipientDocumentType === "Cédula"
                  ? "numeric"
                  : "default"
              }
              placeholder={
                newAddressData.recipientDocumentType === "Cédula"
                  ? "Número de Cédula (11 dígitos)"
                  : "Número de Pasaporte (6-12 caracteres)"
              }
              placeholderTextColor="#999"
              value={newAddressData.recipientDocument}
              onChangeText={(text) => {
                const validatedText =
                  newAddressData.recipientDocumentType === "Cédula"
                    ? text.replace(/[^0-9]/g, "")
                    : text;
                setNewAddressData((prev: any) => ({
                  ...prev,
                  recipientDocument: validatedText,
                }));
              }}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.saveButtonModal, { flex: 1, marginRight: 5 }]}
                onPress={onSave}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButtonModal, { flex: 1, marginLeft: 5 }]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0F294A",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  selectedAddressContainer: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
  },
  selectedAddressText: {
    fontSize: 13,
    color: "#334155",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  saveButtonModal: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonModal: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
