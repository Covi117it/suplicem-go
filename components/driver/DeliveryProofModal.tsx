import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Palette } from "@/constants/theme";

type DeliveryProofModalProps = {
  visible: boolean;
  onClose: () => void;
  deliveryImage: string | null;
  deliveryComment: string;
  onChangeComment: (comment: string) => void;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onSubmit: () => void;
};

export const DeliveryProofModal: React.FC<DeliveryProofModalProps> = ({
  visible,
  onClose,
  deliveryImage,
  deliveryComment,
  onChangeComment,
  onTakePhoto,
  onPickImage,
  onSubmit,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Marcar como entregado</Text>
          <Text style={styles.modalSubTitle}>
            Sube una foto como prueba de entrega y añade un comentario.
          </Text>

          {deliveryImage && (
            <Image
              source={{ uri: deliveryImage }}
              style={styles.deliveryImage}
            />
          )}

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoButton} onPress={onTakePhoto}>
              <Text style={styles.photoButtonText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={onPickImage}>
              <Text style={styles.photoButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Añadir comentario..."
            placeholderTextColor="#999"
            style={styles.commentInput}
            multiline={true}
            value={deliveryComment}
            onChangeText={onChangeComment}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.sendButton]}
              onPress={onSubmit}
            >
              <Text style={styles.modalButtonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeliveryProofModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: Palette.text,
  },
  modalSubTitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  deliveryImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: Palette.accent,
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  photoButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  commentInput: {
    width: "100%",
    minHeight: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
    color: Palette.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
  },
  closeButton: {
    backgroundColor: "#F44336",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
