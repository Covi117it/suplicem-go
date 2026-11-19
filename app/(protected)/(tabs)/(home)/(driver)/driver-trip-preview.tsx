import React from "react";
import { useLocalSearchParams } from "expo-router";
import DriverTripPreviewScreen from "@/features/driver-trips/screens/DriverTripPreviewScreen";

export default function DriverTripPreviewRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  return <DriverTripPreviewScreen tripId={tripId} />;
}
