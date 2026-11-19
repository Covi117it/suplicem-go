import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBankAccounts } from "./hooks/useBankAccounts";
import { BankAccountCard } from "./components/BankAccountCard";
import { BankAccountModal } from "./components/BankAccountModal";

export const BankAccountsScreen: React.FC = () => {
  const {
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
  } = useBankAccounts();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Cuentas Bancarias</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenCreate}>
            <Ionicons name="add-circle" size={22} color="#fff" style={styles.addIcon} />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={52} color="#CBD5E1" />
            <Text style={styles.emptyText}>No hay cuentas bancarias registradas.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={handleOpenCreate}>
              <Text style={styles.emptyAddBtnText}>+ Agregar cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      <BankAccountModal
        visible={modalVisible}
        editingId={editingId}
        form={form}
        typePickerOpen={typePickerOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        setForm={setForm}
        setTypePickerOpen={setTypePickerOpen}
      />
    </View>
  );
};

export default BankAccountsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
  },
  addIcon: {
    marginRight: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
  },
  emptyAddBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0F294A",
    borderRadius: 20,
  },
  emptyAddBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
