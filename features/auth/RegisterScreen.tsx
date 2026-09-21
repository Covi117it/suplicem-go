import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import CustomPickerModal from "@/components/CustomPickerModal";
import { ROLE } from "@/constants/UserConstants";
import { useRegister } from "./hooks/useRegister";
import { RegisterIdUploadCard } from "./components/RegisterIdUploadCard";
import { RegisterPersonalFields } from "./components/RegisterPersonalFields";
import { RegisterAddressSection } from "./components/RegisterAddressSection";
import { RegisterDriverFields } from "./components/RegisterDriverFields";

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    errors,
    addresses,
    userType,
    identificationImage,
    handlePickIdImage,
    addAddress,
    removeAddress,
    onSubmit,
  } = useRegister();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <RegisterPersonalFields control={control} errors={errors} />

        <RegisterIdUploadCard
          identificationImage={identificationImage}
          onPickImage={handlePickIdImage}
          onRemoveImage={() => handlePickIdImage(false)}
        />

        {/* Tipo de Usuario */}
        <Controller
          control={control}
          name="userType"
          render={({ field: { value, onChange } }) => (
            <CustomPickerModal
              label="Tipo de usuario"
              selectedValue={value}
              onValueChange={onChange}
              options={[
                { label: "Cliente", value: "client" },
                { label: "Conductor", value: "driver" },
              ]}
            />
          )}
        />
        {errors.userType && (
          <Text style={styles.error}>{errors.userType.message}</Text>
        )}

        {/* Direcciones si es CLIENTE */}
        {userType === ROLE.CLIENT && (
          <RegisterAddressSection
            control={control}
            addresses={addresses}
            setValue={setValue}
            errors={errors}
            onAddAddress={addAddress}
            onRemoveAddress={removeAddress}
          />
        )}

        {/* Datos de vehículo si es CONDUCTOR */}
        {userType === ROLE.DRIVER && (
          <RegisterDriverFields
            control={control}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al registrarte aceptas nuestros{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/terms")}
            >
              Términos de Uso
            </Text>{" "}
            y{" "}
            <Text
              style={styles.linkInline}
              onPress={() => router.push("/privacy")}
            >
              Política de Privacidad
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#ffffff",
    paddingBottom: 100,
  },
  logo: {
    width: 250,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  linkInline: {
    color: "#0F294A",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
