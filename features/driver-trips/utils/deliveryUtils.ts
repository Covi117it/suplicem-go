export const updateDeliveryStatus = (
  tripData: any,
  orderId: string,
  deliveryIndex: number,
  newStatus: string
): any => {
  const updatedTrip = { ...tripData };
  const order = updatedTrip.orders?.find((o: any) => o.id === orderId);

  if (
    order &&
    Array.isArray(order.deliveries) &&
    deliveryIndex >= 0 &&
    deliveryIndex < order.deliveries.length
  ) {
    order.deliveries[deliveryIndex].status = newStatus;
  }
  return updatedTrip;
};
