import { useState, useCallback, useEffect } from "react";
import { Linking, Alert } from "react-native";
import { getUserById, activeOrInactiveUser } from "@/services/userService";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";

export function useAdminUserDetail(userId?: string, initialUser?: any) {
  const [user, setUser] = useState<any>(initialUser || null);
  const [refreshing, setRefreshing] = useState(false);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setRefreshing(true);
      const res = await getUserById(userId);
      if (res?.success && res.user) {
        setUser(res.user);
      }
    } catch (error) {
      console.error("Error al obtener detalle del usuario:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    if (userId) {
      getUserById(userId)
        .then((res) => {
          if (isMounted && res?.success && res.user) {
            setUser(res.user);
          }
        })
        .catch((error) => {
          console.error("Error al obtener detalle del usuario:", error);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleCall = (phone?: string) => {
    if (!phone) {
      showAlert({ message: "El usuario no tiene teléfono registrado", type: "warning" });
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone?: string) => {
    if (!phone) {
      showAlert({ message: "El usuario no tiene teléfono registrado", type: "warning" });
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const formatted = cleanPhone.startsWith("+") ? cleanPhone : `+1${cleanPhone}`;
    Linking.openURL(`whatsapp://send?phone=${formatted}`);
  };

  const handleToggleStatus = (newStatus: "active" | "inactive") => {
    const actionText = newStatus === "active" ? "activar" : "inactivar";
    Alert.alert(
      "Confirmación",
      `¿Estás seguro de que deseas ${actionText} la cuenta de ${user?.names || "este usuario"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: newStatus === "inactive" ? "destructive" : "default",
          onPress: async () => {
            if (!user?.uid) return;
            try {
              show();
              const res = await activeOrInactiveUser(user.uid, newStatus);
              if (res) {
                setUser((prev: any) => ({ ...prev, status: newStatus }));
                showAlert({
                  message: `Usuario ${newStatus === "active" ? "activado" : "inactivado"} exitosamente`,
                  type: "success",
                });
              } else {
                showAlert({ message: "No se pudo actualizar el estado", type: "error" });
              }
            } catch (error) {
              console.error(error);
              showAlert({ message: "Error al actualizar el estado", type: "error" });
            } finally {
              hide();
            }
          },
        },
      ]
    );
  };

  return {
    user,
    refreshing,
    fetchUser,
    handleCall,
    handleWhatsapp,
    handleToggleStatus,
  };
}