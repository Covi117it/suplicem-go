import React from "react";
import { useLocalSearchParams } from "expo-router";
import { DriverTripHistoryDetailScreen } from "@/features/driver-trips/screens/DriverTripHistoryDetailScreen";

export default function DriverTripDetailRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return <DriverTripHistoryDetailScreen tripId={tripId} />;
}
