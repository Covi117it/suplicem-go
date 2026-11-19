import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import {
  BankAccount,
  CreateBankAccountPayload,
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  updateBankAccount,
} from "@/services/configService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { emptyForm } from "../types";

export const useBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBankAccountPayload>(emptyForm);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchAccounts = useCallback(async () => {
    try {
      show();
      const data = await getBankAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("[BankAccounts] Error al cargar:", error);
      showAlert({ message: "No se pudieron cargar las cuentas bancarias.", type: "error" });
    } finally {
      hide();
    }
  }, [show, hide, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [fetchAccounts])
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const handleOpenEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      accountHolder: account.accountHolder,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      routingNumber: account.routingNumber || "",
      swiftCode: account.swiftCode || "",
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setForm(emptyForm);
    setTypePickerOpen(false);
  };

  const handleSave = async () => {
    if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim()) {
      showAlert({
        message: "Banco, titular y número de cuenta son obligatorios.",
        type: "warning",
      });
      return;
    }

    try {
      show();
      if (editingId) {
        const result = await updateBankAccount(editingId, form);
        if (result.success) {
          showAlert({ message: "¡Cuenta bancaria actualizada correctamente!", type: "success" });
          handleCloseModal();
          await fetchAccounts();
        } else {
          showAlert({ message: result.message || "Error al actualizar.", type: "error" });
        }
      } else {
        const result = await createBankAccount(form);
        if (result.success) {
          showAlert({ message: "¡Cuenta bancaria creada correctamente!", type: "success" });
          handleCloseModal();
          await fetchAccounts();
        } else {
          showAlert({ message: result.message || "Error al crear.", type: "error" });
        }
      }
    } catch (error) {
      console.error("[BankAccounts] Error al guardar:", error);
      showAlert({ message: "Ocurrió un error al guardar la cuenta.", type: "error" });
    } finally {
      hide();
    }
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      "Eliminar Cuenta",
      `¿Estás seguro de que deseas eliminar la cuenta de ${account.bankName}?\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              show();
              const result = await deleteBankAccount(account.id);
              if (result.success) {
                showAlert({ message: "Cuenta bancaria eliminada.", type: "success" });
                await fetchAccounts();
              } else {
                showAlert({ message: result.message || "Error al eliminar.", type: "error" });
              }
            } catch (error) {
              console.error("[BankAccounts] Error al eliminar:", error);
              showAlert({ message: "No se pudo eliminar la cuenta.", type: "error" });
            } finally {
              hide();
            }
          },
        },
      ]
    );
  };

  return {
    accounts,
    modalVisible,
    editingId,
    form,
    setForm,
    typePickerOpen,
    setTypePickerOpen,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSave,
    handleDelete,
  };
};
