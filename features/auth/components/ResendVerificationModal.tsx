import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ResendVerificationModalProps {
  visible: boolean;
  email: string;
  onChangeEmail: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const ResendVerificationModal: React.FC<ResendVerificationModalProps> = ({
  visible,
  email,
  onChangeEmail,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Verificación de Cuenta</Text>
          <Text style={styles.modalSubtitle}>
            Ingresa tu correo electrónico registrado para enviarte un nuevo enlace de activación.
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={onChangeEmail}
          />

          <TouchableOpacity style={styles.modalButton} onPress={onSubmit}>
            <Text style={styles.modalButtonText}>Reenviar correo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    width: "100%",
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#1E293B",
  },
  modalButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalCancelText: {
    color: "#0F294A",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
