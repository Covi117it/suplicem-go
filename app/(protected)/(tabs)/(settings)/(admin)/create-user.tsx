import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { createUserAccount } from "@/services/userService";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

const CreateUserScreen: React.FC = () => {
  const [names, setNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [email, setEmail] = useState("");
  const [identification, setIdentification] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("client");
  const [password, setPassword] = useState("");
  const [clientAddress, setClientAddress] = useState<any>(null);

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const handleCreateUser = async () => {
    if (!names || !lastNames || !email || !password || !phone) {
      showAlert({
        message: "Por favor, completa todos los campos requeridos.",
        type: "warning",
      });
      return;
    }

    const payload: any = {
      identificationType: "Cedula",
      identification: identification || "00000000000",
      email,
      password,
      confirmPassword: password,
      names,
      lastNames,
      phone,
      userType: userType === "conductor" ? "driver" : userType === "admin" ? "admin" : "client",
      addresses: clientAddress?.description ? [clientAddress] : [],
    };

    try {
      show();
      const res = await createUserAccount(payload);
      if (res?.success) {
        showAlert({
          message: "¡Usuario registrado y actualizado con éxito en la base de datos del servidor!",
          type: "success",
        });
        setNames("");
        setLastNames("");
        setEmail("");
        setIdentification("");
        setPhone("");
        setPassword("");
        setUserType("client");
      } else {
        showAlert({
          message: res?.message || "No se pudo registrar el usuario en el servidor.",
          type: "error",
        });
      }
    } catch (error: any) {
      showAlert({
        message: error?.message || "Ocurrió un error al crear la cuenta.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crear Nueva Cuenta de Usuario</Text>

      <Text style={styles.label}>Nombres</Text>
      <TextInput
        placeholder="Ej: Juan"
        placeholderTextColor="#999"
        value={names}
        onChangeText={setNames}
        style={styles.input}
      />

      <Text style={styles.label}>Apellidos</Text>
      <TextInput
        placeholder="Ej: Pérez"
        placeholderTextColor="#999"
        value={lastNames}
        onChangeText={setLastNames}
        style={styles.input}
      />

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        placeholder="correo@ejemplo.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>No. de Identificación / Cédula</Text>
      <TextInput
        placeholder="00100000000"
        placeholderTextColor="#999"
        value={identification}
        onChangeText={setIdentification}
        style={styles.input}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        placeholder="8095551234"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <CustomPickerModal
        label="Rol de Usuario"
        selectedValue={userType}
        onValueChange={setUserType}
        options={[
          { label: "Cliente", value: "client" },
          { label: "Conductor", value: "driver" },
          { label: "Administrador", value: "admin" },
        ]}
      />

      {userType === "client" && (
        <>
          <Text style={styles.label}>Dirección Inicial de Entrega</Text>
          <AddressPicker
            onPlaceSelected={(place) => setClientAddress(place)}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
        <Text style={styles.buttonText}>Crear Usuario en Servidor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 22,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#0F294A",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    color: "#000",
  },
  button: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
