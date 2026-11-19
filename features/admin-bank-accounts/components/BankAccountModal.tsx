import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateBankAccountPayload } from "@/services/configService";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPES } from "../types";

interface BankAccountModalProps {
  visible: boolean;
  editingId: string | null;
  form: CreateBankAccountPayload;
  typePickerOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  setForm: React.Dispatch<React.SetStateAction<CreateBankAccountPayload>>;
  setTypePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  visible,
  editingId,
  form,
  typePickerOpen,
  onClose,
  onSave,
  setForm,
  setTypePickerOpen,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Banco *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Banco Popular"
              placeholderTextColor="#999"
              value={form.bankName}
              onChangeText={(t) => setForm((p) => ({ ...p, bankName: t }))}
            />

            <Text style={styles.inputLabel}>Titular de la cuenta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              placeholderTextColor="#999"
              value={form.accountHolder}
              onChangeText={(t) => setForm((p) => ({ ...p, accountHolder: t }))}
            />

            <Text style={styles.inputLabel}>Número de cuenta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 000123456789"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={form.accountNumber}
              onChangeText={(t) => setForm((p) => ({ ...p, accountNumber: t }))}
            />

            <Text style={styles.inputLabel}>Tipo de cuenta *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setTypePickerOpen((o) => !o)}
            >
              <Text style={styles.pickerButtonText}>
                {ACCOUNT_TYPE_LABELS[form.accountType]}
              </Text>
              <Ionicons
                name={typePickerOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
            {typePickerOpen && (
              <View style={styles.pickerDropdown}>
                {ACCOUNT_TYPES.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pickerOption,
                      form.accountType === opt.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setForm((p) => ({ ...p, accountType: opt.value }));
                      setTypePickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        form.accountType === opt.value && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {form.accountType === opt.value && (
                      <Ionicons name="checkmark" size={16} color="#E31E24" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Moneda *</Text>
            <TextInput
              style={styles.input}
              placeholder="DOP o USD"
              placeholderTextColor="#999"
              value={form.currency}
              autoCapitalize="characters"
              onChangeText={(t) => setForm((p) => ({ ...p, currency: t.toUpperCase() }))}
            />

            <Text style={styles.inputLabel}>Código SWIFT (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. BPDODOSX"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              value={form.swiftCode}
              onChangeText={(t) => setForm((p) => ({ ...p, swiftCode: t.toUpperCase() }))}
            />

            <Text style={styles.inputLabel}>Número de ruta / Routing (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 123456789"
              placeholderTextColor="#999"
              value={form.routingNumber}
              onChangeText={(t) => setForm((p) => ({ ...p, routingNumber: t }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                <Text style={styles.saveBtnText}>
                  {editingId ? "Guardar Cambios" : "Crear Cuenta"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    color: "#1E293B",
    marginBottom: 2,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
    marginBottom: 2,
  },
  pickerButtonText: {
    fontSize: 15,
    color: "#1E293B",
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 2,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  pickerOptionSelected: {
    backgroundColor: "#FFF1F2",
  },
  pickerOptionText: {
    fontSize: 15,
    color: "#1E293B",
  },
  pickerOptionTextSelected: {
    color: "#E31E24",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#E31E24",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
