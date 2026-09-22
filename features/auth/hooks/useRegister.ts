import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { createUserAccount } from "@/services/userService";
import { RegisterFormData } from "@/types/users";
import { registerSchema } from "@/validations/registerSchema";
import { pickAndCompressImage } from "@/utils/imageUtils";
import { saveAuthSession } from "@/utils/authStorage";

export const useRegister = () => {
  const authContext = useContext(AuthContext);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [identificationImage, setIdentificationImage] = useState<string | null>(null);

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
        plateNumber: "",
      },
    },
  });

  const addresses = watch("addresses") || [];
  const userType = watch("userType");

  const handlePickIdImage = async (useCamera: boolean = false) => {
    const result = await pickAndCompressImage({ useCamera, maxWidth: 800, quality: 0.5 });
    if (!result.success) {
      if (result.errorMessage) {
        showAlert({ message: result.errorMessage, type: "warning" });
      }
      return;
    }
    if (result.uri) {
      setIdentificationImage(result.uri);
      showAlert({
        message: "¡Foto de la cédula/identificación adjuntada correctamente!",
        type: "success",
      });
    }
  };

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

    if (payload.userType !== "driver") {
      delete payload.vehicle;
    }
    if (payload.userType === "driver" && (!payload.addresses || payload.addresses.length === 0)) {
      delete payload.addresses;
    }
    delete payload.confirmPassword;

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
        const errorList = responseRegister?.data?.errors;
        let errorMsg = responseRegister?.message;
        if (Array.isArray(errorList) && errorList.length > 0) {
          errorMsg = errorList.map((err: any) => `${err.field}: ${err.message}`).join("\n");
        }
        showAlert({
          message:
            errorMsg ||
            (responseRegister?.data as any)?.error ||
            "No se pudo completar el registro.",
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

  return {
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
  };
};
