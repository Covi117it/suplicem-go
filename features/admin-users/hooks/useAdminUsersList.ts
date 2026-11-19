import { useState, useMemo, useContext, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { AuthContext } from "@/context/authContext";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { activeOrInactiveUser, getUsers } from "@/services/userService";
import { FilterOption } from "@/components/FilterChips";

export type RoleFilter = "all" | "client" | "seller" | "driver" | "admin";
export type StatusFilter = "all" | "active" | "inactive";

export const ROLE_OPTIONS: FilterOption<RoleFilter>[] = [
  { id: "all", label: "Todos los roles" },
  { id: "client", label: "Clientes" },
  { id: "seller", label: "Vendedores" },
  { id: "driver", label: "Conductores" },
  { id: "admin", label: "Administradores" },
];

export const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { id: "all", label: "Cualquier estado" },
  { id: "active", label: "Activos" },
  { id: "inactive", label: "Inactivos" },
];

const sortUsers = (usersArray: any[]) => {
  const sortedArray = [...usersArray];
  return sortedArray.sort((a, b) => {
    if (a.status === "inactive" && b.status !== "inactive") return -1;
    if (a.status !== "inactive" && b.status === "inactive") return 1;
    if (a.status === "active" && b.status !== "active") return 1;
    if (a.status !== "active" && b.status === "active") return -1;
    return 0;
  });
};

export const useAdminUsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { user: authUser } = useContext(AuthContext);
  const router = useRouter();

  const handleSelectUser = (user: any) => {
    router.push({
      pathname: "/user-detail",
      params: {
        userId: user.uid,
        userParam: JSON.stringify(user),
      },
    });
  };

  const fetchUsers = async () => {
    try {
      show();
      const response = await getUsers();
      if (response.success) {
        setUsers(sortUsers(response.users));
      } else {
        showAlert({
          message: "No se pudieron obtener los usuarios.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al obtener los usuarios.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleActivate = async (uid: string) => {
    try {
      show();
      const response = await activeOrInactiveUser(uid, "active");
      if (response) {
        const updatedUsers = users.map((user) =>
          user.uid === uid ? { ...user, status: "active" } : user
        );
        setUsers(sortUsers(updatedUsers));
        showAlert({
          message: "Usuario activado correctamente.",
          type: "success",
        });
      } else {
        showAlert({
          message: "No se pudo activar el usuario.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al activar el usuario.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const handleInactivate = async (uid: string) => {
    if (uid === authUser?.uid) {
      showAlert({
        message: "No puedes inactivar tu propia cuenta de administrador.",
        type: "error",
      });
      return;
    }
    try {
      show();
      const response = await activeOrInactiveUser(uid, "inactive");
      if (response) {
        const updatedUsers = users.map((user) =>
          user.uid === uid ? { ...user, status: "inactive" } : user
        );
        setUsers(sortUsers(updatedUsers));
        showAlert({
          message: "Usuario inactivado correctamente.",
          type: "success",
        });
      } else {
        showAlert({
          message: "No se pudo inactivar el usuario.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "Ocurrió un error al inactivar el usuario.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const roleCounts = useMemo(() => {
    const relevantUsers = statusFilter === "all"
      ? users
      : users.filter((u) => {
          const st = u.status?.toLowerCase();
          if (statusFilter === "active") return st === "active";
          if (statusFilter === "inactive") return st === "inactive" || st === "pending";
          return true;
        });

    const counts = { all: relevantUsers.length, client: 0, seller: 0, driver: 0, admin: 0 };
    relevantUsers.forEach((u) => {
      const role = u.userType?.toLowerCase();
      if (role === "client") counts.client++;
      else if (role === "seller") counts.seller++;
      else if (role === "driver") counts.driver++;
      else if (role === "admin") counts.admin++;
    });
    return counts;
  }, [users, statusFilter]);

  const statusCounts = useMemo(() => {
    const relevantUsers = roleFilter === "all"
      ? users
      : users.filter((u) => u.userType?.toLowerCase() === roleFilter);
    const counts = { all: relevantUsers.length, active: 0, inactive: 0 };
    relevantUsers.forEach((u) => {
      const st = u.status?.toLowerCase();
      if (st === "active") counts.active++;
      else if (st === "inactive" || st === "pending") counts.inactive++;
    });
    return counts;
  }, [users, roleFilter]);

  const filteredUsers = useMemo(() => {
    return sortUsers(
      users.filter((user) => {
        if (roleFilter !== "all" && user.userType?.toLowerCase() !== roleFilter) {
          return false;
        }

        if (statusFilter === "active" && user.status?.toLowerCase() !== "active") {
          return false;
        }
        if (
          statusFilter === "inactive" &&
          user.status?.toLowerCase() !== "inactive" &&
          user.status?.toLowerCase() !== "pending"
        ) {
          return false;
        }

        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          user.names?.toLowerCase().includes(query) ||
          user.lastNames?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.identification?.toLowerCase().includes(query) ||
          user.driverCode?.toLowerCase().includes(query) ||
          user.sellerCode?.toLowerCase().includes(query) ||
          user.sellerName?.toLowerCase().includes(query) ||
          user.vehicle?.plateNumber?.toLowerCase().includes(query)
        );
      })
    );
  }, [users, roleFilter, statusFilter, search]);

  return {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    refreshing,
    onRefresh,
    roleCounts,
    statusCounts,
    filteredUsers,
    authUser,
    handleSelectUser,
    handleActivate,
    handleInactivate,
  };
};
