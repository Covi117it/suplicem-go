import React from "react";
import { useLocalSearchParams } from "expo-router";
import { AdminUserDetailScreen } from "@/features/admin-users/screens/AdminUserDetailScreen";

export default function AdminUserDetailRoute() {
  const { userId, userParam } = useLocalSearchParams<{
    userId?: string;
    userParam?: string;
  }>();

  let initialUser;
  if (userParam) {
    try {
      initialUser = JSON.parse(userParam);
    } catch {
      initialUser = undefined;
    }
  }

  return <AdminUserDetailScreen userId={userId} initialUser={initialUser} />;
}
