import React from "react";
import { Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IdPhotoModalProps {
  imageUri: string | null;
  onClose: () => void;
}

export const IdPhotoModal: React.FC<IdPhotoModalProps> = ({ imageUri, onClose }) => {
  return (
    <Modal
      visible={Boolean(imageUri)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalViewerOverlay}>
        <TouchableOpacity style={styles.closeViewerButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.fullViewerImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeViewerButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullViewerImage: {
    width: "90%",
    height: "80%",
  },
});
