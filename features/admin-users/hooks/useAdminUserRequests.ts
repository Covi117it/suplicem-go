import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { activeOrInactiveUser, getUsers } from "@/services/userService";
import { User } from "@/types/users";

export const useAdminUserRequests = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [aiAlertUsers, setAiAlertUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "ai_alerts">("pending");
  const [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchUsers = useCallback(async () => {
    try {
      setRefreshing(true);
      const [pendingRes, aiRes] = await Promise.all([
        getUsers({ status: "pending" }),
        getUsers({ aiRiskFlag: true }),
      ]);

      if (pendingRes?.success && pendingRes.users) {
        setPendingUsers(pendingRes.users);
      }
      if (aiRes?.success && aiRes.users) {
        setAiAlertUsers(aiRes.users);
      }
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
      showAlert({
        message: "Error al obtener solicitudes de registro",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      show();
      const res = await activeOrInactiveUser(uid, status);
      if (res?.message) {
        showAlert({
          message: `Estado actualizado a "${status === "active" ? "Aprobado" : "Rechazado"}"`,
          type: status === "active" ? "success" : "info",
        });
        setPendingUsers((prev) => prev.filter((u) => u.uid !== uid));
        setAiAlertUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, status } : u))
        );
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "No se pudo actualizar el estado del usuario",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const currentList = activeTab === "pending" ? pendingUsers : aiAlertUsers;

  return {
    pendingUsers,
    aiAlertUsers,
    activeTab,
    setActiveTab,
    selectedIdImage,
    setSelectedIdImage,
    refreshing,
    fetchUsers,
    handleUpdateStatus,
    currentList,
  };
};
