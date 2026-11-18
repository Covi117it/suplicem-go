import { useContext, useEffect, useState, startTransition } from "react";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { updateDriverProfile } from "@/services/userService";

export function useDriverProfile() {
  const { user, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicleBrand, setVehicleBrand] = useState(user?.vehicle?.brand || "");
  const [vehicleModel, setVehicleModel] = useState(user?.vehicle?.model || "");
  const [vehicleYear, setVehicleYear] = useState(user?.vehicle?.year || "");
  const [vehicleTons, setVehicleTons] = useState(user?.vehicle?.tons || "");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(user?.vehicle?.plateNumber || "");

  useEffect(() => {
    if (user) {
      startTransition(() => {
        setPhone(user.phone || "");
        setVehicleBrand(user.vehicle?.brand || "");
        setVehicleModel(user.vehicle?.model || "");
        setVehicleYear(user.vehicle?.year || "");
        setVehicleTons(user.vehicle?.tons || "");
        setVehiclePlateNumber(user.vehicle?.plateNumber || "");
      });
    }
  }, [user]);

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!user) {
      showAlert({
        message: "No se puede guardar, el usuario no está disponible.",
        type: "error",
      });
      return;
    }

    try {
      show();
      await updateDriverProfile(
        user.uid,
        phone,
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        vehicleTons,
        vehiclePlateNumber
      );

      const newUser = {
        ...user,
        phone,
        vehicle: {
          ...(user.vehicle || {}),
          brand: vehicleBrand,
          model: vehicleModel,
          year: vehicleYear,
          tons: vehicleTons,
          plateNumber: vehiclePlateNumber,
        },
      };

      logIn(newUser);
      showAlert({
        message: "¡Perfil y datos del vehículo actualizados con éxito!",
        type: "success",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error en actualización del conductor:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo actualizar el perfil. Inténtelo de nuevo.";
      showAlert({
        message: errorMsg,
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setPhone(user.phone || "");
      setVehicleBrand(user.vehicle?.brand || "");
      setVehicleModel(user.vehicle?.model || "");
      setVehicleYear(user.vehicle?.year || "");
      setVehicleTons(user.vehicle?.tons || "");
      setVehiclePlateNumber(user.vehicle?.plateNumber || "");
    }
  };

  const onChangeVehicle = (updated: any) => {
    if (updated.brand !== undefined) {
      setVehicleBrand(updated.brand);
      setVehicleModel("");
    }
    if (updated.model !== undefined) setVehicleModel(updated.model);
    if (updated.year !== undefined) setVehicleYear(updated.year);
    if (updated.tons !== undefined) setVehicleTons(updated.tons);
    if (updated.plateNumber !== undefined) setVehiclePlateNumber(updated.plateNumber);
  };

  return {
    user,
    isEditing,
    setIsEditing,
    phone,
    setPhone,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    vehicleTons,
    vehiclePlateNumber,
    handleEdit,
    handleCancel,
    onChangeVehicle,
  };
}
