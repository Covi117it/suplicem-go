import AddressPicker from "@/components/AddressPicker";
import CustomPickerModal from "@/components/CustomPickerModal";
import { ROLE } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { createUserAccount } from "@/services/userService";
import { RegisterFormData } from "@/types/users";
import { registerSchema } from "@/validations/registerSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "@/context/authContext";
import { saveAuthSession } from "@/utils/authStorage";

export default function RegisterScreen() {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [identificationImage, setIdentificationImage] = useState<string | null>(null);

  const handlePickIdImage = async (useCamera: boolean = false) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showAlert({
          message: "Se requiere permiso para adjuntar la foto del documento",
          type: "warning",
        });
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        // Redimensionar a un máximo de 800px de ancho y comprimir a JPEG ligero
        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        setIdentificationImage(manipResult.uri);
        showAlert({
          message: "¡Foto de la cédula/identificación adjuntada correctamente!",
          type: "success",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "No se pudo cargar la imagen",
        type: "error",
      });
    }
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      identificationType: "Cedula",
      identification: "",
      email: "",
      password: "",
      confirmPassword: "",
      names: "",
      lastNames: "",
      phone: "",
      userType: "client",
      addresses: [],
      vehicle: {
        brand: "",
        model: "",
        year: "",
        tons: "",
        plateNumber: "", // Nuevo campo para el número de placa
      },
    },
  });

  const addresses = watch("addresses") || [];
  const userType = watch("userType");

  const addAddress = () => {
    setValue("addresses", [
      ...addresses,
      {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
        additionalInfo: "",
      },
    ]);
  };

  const removeAddress = (index: number) => {
    const updated = addresses?.filter((_, i) => i !== index);
    setValue("addresses", updated);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!identificationImage) {
      showAlert({
        message: "Debes adjuntar la foto de tu cédula o pasaporte para la verificación de cuenta por el administrador.",
        type: "warning",
      });
      return;
    }

    const payload: any = {
      ...data,
      identificationImage,
    };

    show();
    try {
      const responseRegister = await createUserAccount(payload);

      if (responseRegister?.success && responseRegister?.data?.success) {
        const regData = responseRegister.data;
        if (regData.idToken && regData.user) {
          const now = Date.now();
          const newSession = {
            token: regData.idToken,
            refreshToken: regData.refreshToken,
            expiresAt: now + parseInt(regData.expiresIn || "3600") * 1000,
          };
          await saveAuthSession(newSession);
          authContext.logIn(regData.user);
        }

        reset();
        setIdentificationImage(null);
        showAlert({
          message:
            "¡Registro exitoso! Tu solicitud ha sido guardada y está pendiente de verificación por el Administrador.",
          type: "success",
        });
        router.replace("/pending-approval");
      } else {
        const errorMsg =
          responseRegister?.message ||
          (responseRegister?.data as any)?.error ||
          "No se pudo completar el registro.";
        showAlert({
          message: errorMsg,
          type: "error",
        });
      }
    } catch (err: any) {
      console.error(err);
      showAlert({
        message: err?.message || "Ocurrió un error inesperado al procesar el registro.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Controller
          control={control}
          name="identificationType"
          render={({ field: { value, onChange } }) => (
            <CustomPickerModal
              label="Tipo de documento"
              selectedValue={value}
              onValueChange={onChange}
              options={[
                { label: "Cédula", value: "Cedula" },
                { label: "Pasaporte", value: "Pasaporte" },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="identification"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="No. de identificación"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
              keyboardType="default"
            />
          )}
        />
        {errors.identification && (
          <Text style={styles.error}>{errors.identification.message}</Text>
        )}

        {/* Tarjeta de carga de foto de Cédula / Identificación */}
        <View style={styles.idUploadCard}>
          <Text style={styles.idUploadTitle}>
            🪪 Foto de Cédula / Identificación
          </Text>
          <Text style={styles.idUploadSubtext}>
            Adjunta una foto clara del documento. El Administrador revisará la imagen para activar tu cuenta.
          </Text>

          {identificationImage ? (
            <View style={styles.idPreviewContainer}>
              <Image source={{ uri: identificationImage }} style={styles.idImagePreview} />
              <TouchableOpacity
                style={styles.removeIdButton}
                onPress={() => setIdentificationImage(null)}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.removeIdText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptionsRow}>
              <TouchableOpacity
                style={styles.uploadIdButtonHalf}
                onPress={() => handlePickIdImage(false)}
              >
                <Ionicons name="images-outline" size={18} color="#0F294A" />
                <Text style={styles.uploadIdButtonText}>Galería</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadIdButtonHalf}
                onPress={() => handlePickIdImage(true)}
              >
                <Ionicons name="camera-outline" size={18} color="#0F294A" />
                <Text style={styles.uploadIdButtonText}>Cámara</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        {/* Contraseña */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password.message}</Text>
        )}

        {/* Confirmar contraseña */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
        )}

        <Controller
          control={control}
          name="names"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nombres"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.names && (
          <Text style={styles.error}>{errors.names.message}</Text>
        )}

        <Controller
          control={control}
          name="lastNames"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              placeholderTextColor="#999"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.lastNames && (
          <Text style={styles.error}>{errors.lastNames.message}</Text>
        )}

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.phone && (
          <Text style={styles.error}>{errors.phone.message}</Text>
        )}

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
          <View>
            <Text style={styles.sectionTitle}>Direcciones</Text>

            {addresses.map((addr, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={{ marginBottom: 4, fontWeight: "500" }}>
                  {addr?.description || "Selecciona una dirección"}
                </Text>
                <Text style={{ marginBottom: 4, fontWeight: "500" }}>
                  Referencias: {""}
                  {addr?.additionalInfo || ""}
                </Text>
                <AddressPicker
                  initialValue={addr?.description || ""}
                  onPlaceSelected={(place) => {
                    const updated = [...addresses];
                    updated[index] = { ...updated[index], ...place };
                    setValue("addresses", updated);
                  }}
                />

                <Controller
                  control={control}
                  name={`addresses.${index}.additionalInfo`}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Información adicional (ej: Apto. 402, frente a Supermercado)"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />

                {errors.addresses?.[index]?.description && (
                  <Text style={styles.error}>
                    {errors.addresses[index]?.description?.message}
                  </Text>
                )}
                {addresses.length > 1 && (
                  <TouchableOpacity onPress={() => removeAddress(index)}>
                    <Text style={styles.link}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={addAddress}>
              <Text style={styles.link}>+ Agregar dirección</Text>
            </TouchableOpacity>
          </View>
        )}

        {userType === ROLE.DRIVER && (
          <View>
            <Text style={styles.sectionTitle}>Datos del vehículo</Text>

            {/* Marca */}
            <Controller
              control={control}
              name="vehicle.brand"
              render={({ field: { onChange, value } }) => (
                <CustomPickerModal
                  label="Marca"
                  selectedValue={value || ""}
                  onValueChange={(selectedBrand) => {
                    onChange(selectedBrand);
                    // Resetear el modelo si se cambia la marca
                    setValue("vehicle.model", "");
                  }}
                  options={[
                    { label: "Toyota", value: "Toyota" },
                    { label: "Hyundai", value: "Hyundai" },
                    { label: "Isuzu", value: "Isuzu" },
                    { label: "Mitsubishi", value: "Mitsubishi" },
                  ]}
                />
              )}
            />

            {/* Modelo (según marca) */}
            <Controller
              control={control}
              name="vehicle.model"
              render={({ field: { onChange, value } }) => {
                const brand = watch("vehicle.brand") || "";
                const modelOptions: any = {
                  Toyota: ["Dyna", "Hilux", "Hiace"],
                  Hyundai: ["H100", "Porter", "Mighty"],
                  Isuzu: ["Elf", "NPR", "FRR"],
                  Mitsubishi: ["Canter", "Fuso", "L200"],
                };

                return (
                  <CustomPickerModal
                    label="Modelo"
                    selectedValue={value || ""}
                    onValueChange={onChange}
                    options={(modelOptions[brand] || []).map((model: any) => ({
                      label: model,
                      value: model,
                    }))}
                  />
                );
              }}
            />

            {/* Año */}
            <Controller
              control={control}
              name="vehicle.year"
              render={({ field: { value, onChange } }) => (
                <CustomPickerModal
                  label="Año"
                  selectedValue={value || ""}
                  onValueChange={onChange}
                  options={Array.from({ length: 35 }, (_, i) => {
                    const year = `${1990 + i}`;
                    return { label: year, value: year };
                  })}
                />
              )}
            />
            {/* Nuevo campo de número de placa */}
            <Controller
              control={control}
              name="vehicle.plateNumber"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Número de placa"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="characters"
                />
              )}
            />
            {/* Toneladas */}
            <Controller
              control={control}
              name="vehicle.tons"
              render={({ field: { value, onChange } }) => (
                <CustomPickerModal
                  label="Toneladas"
                  selectedValue={value || ""}
                  onValueChange={onChange}
                  options={[
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "5", value: "5" },
                    { label: "10", value: "10" },
                    { label: "20", value: "20" },
                  ]}
                />
              )}
            />

            {errors.vehicle?.plateNumber && (
              <Text style={styles.error}>
                {errors.vehicle.plateNumber.message}
              </Text>
            )}

            {errors.vehicle && typeof errors.vehicle === "object" && (
              <>
                {Object.entries(errors.vehicle).map(([key, err]) => (
                  <Text key={key} style={styles.error}>
                    {(err as any)?.message}
                  </Text>
                ))}
              </>
            )}
          </View>
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
}

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
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    color: "#000",
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
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#E31E24",
    textDecorationLine: "underline",
    fontSize: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    marginTop: 10,
    color: "#0F294A",
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    textAlign: "center",
    fontSize: 13,
    color: "#555",
  },
  linkInline: {
    color: "#E31E24",
    textDecorationLine: "underline",
  },
  idUploadCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
  },
  idUploadTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  idUploadSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 16,
  },
  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  uploadIdButtonHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  uploadIdButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
  },
  idPreviewContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  idImagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 6,
    marginBottom: 8,
  },
  removeIdButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E31E24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeIdText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});
