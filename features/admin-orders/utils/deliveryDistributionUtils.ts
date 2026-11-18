import { DeliveryDetail as OrderDelivery, Order } from "@/types/orders";
import { TruckTripItem } from "../components/approval/TripTruckRow";

/**
 * Distribuye equitativamente la cantidad total de un producto entre N entregas
 * asegurando múltiplos de step (50 para cemento) y que la suma sea exacta.
 */
export function distributeEquitably(totalQty: number, count: number, step = 50): number[] {
  if (count <= 0) return [];
  if (count === 1) return [totalQty];

  const rawPerDelivery = Math.floor(totalQty / count);
  const baseQty = Math.max(step, Math.floor(rawPerDelivery / step) * step);
  const result: number[] = Array(count).fill(baseQty);
  let currentSum = baseQty * count;
  let remaining = totalQty - currentSum;

  let i = 0;
  while (remaining >= step) {
    result[i % count] += step;
    remaining -= step;
    i++;
  }
  if (remaining > 0) {
    result[0] += remaining;
  }
  return result;
}

/**
 * Redistribuye equitativamente las fundas de todas las entregas que comparten el mismo producto
 */
export function redistributeEquitably(
  deliveries: OrderDelivery[],
  order: Order | null | undefined
): OrderDelivery[] {
  if (!order || deliveries.length === 0) return deliveries;

  const productIds = Array.from(
    new Set(deliveries.map((d) => d.productId || order.items?.[0]?.productId || ""))
  );
  let updated = [...deliveries];

  for (const prodId of productIds) {
    if (!prodId) continue;
    const orderItem = order.items?.find((it) => it.productId === prodId);
    const totalOrdered = orderItem?.quantity || 0;
    const matchingIndices = updated
      .map((d, idx) => (d.productId === prodId ? idx : -1))
      .filter((idx) => idx !== -1);

    if (matchingIndices.length === 0 || totalOrdered <= 0) continue;

    const isCement = (orderItem?.name || "").toLowerCase().includes("cemento");
    const step = isCement ? 50 : 1;
    const distributed = distributeEquitably(totalOrdered, matchingIndices.length, step);

    matchingIndices.forEach((delIdx, i) => {
      updated[delIdx] = {
        ...updated[delIdx],
        quantity: distributed[i] || 0,
      };
    });
  }

  return updated;
}

/**
 * Redistribuye el tonelaje total de la entrega cuando se elimina un camión.
 * Si queda 1 solo camión, asume el 100% de totalTons.
 * Si quedan múltiples, distribuye la diferencia faltante de forma equitativa y exacta.
 */
export function rebalanceTrucksOnRemove(
  trucks: TruckTripItem[],
  totalTons: number,
  removedTruckId: string
): TruckTripItem[] {
  const remaining = trucks.filter((t) => t.id !== removedTruckId);
  if (remaining.length === 0) return [];
  if (remaining.length === 1) {
    return [{ ...remaining[0], totalTons: Number(totalTons.toFixed(2)) }];
  }

  const currentSum = remaining.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const diff = Number((totalTons - currentSum).toFixed(2));

  if (diff > 0) {
    const count = remaining.length;
    const share = Number((diff / count).toFixed(2));
    let allocated = 0;

    return remaining.map((truck, idx) => {
      if (idx === count - 1) {
        const remainingDiff = Number((diff - allocated).toFixed(2));
        return { ...truck, totalTons: Number((truck.totalTons + remainingDiff).toFixed(2)) };
      }
      allocated += share;
      return { ...truck, totalTons: Number((truck.totalTons + share).toFixed(2)) };
    });
  }

  return remaining;
}

/**
 * Calcula los camiones al agregar uno nuevo para una entrega.
 * Si hay toneladas faltantes, el nuevo camión asume ese remanente.
 * Si ya estaba equilibrado, redistribuye uniformemente el total entre todos los camiones.
 */
export function calculateTrucksOnAdd(
  trucks: TruckTripItem[],
  totalTons: number,
  deliveryId?: string,
  delIdx: number = 0
): TruckTripItem[] {
  const currentPlanned = trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const missing = Number((totalTons - currentPlanned).toFixed(2));

  if (missing > 0.05) {
    return [
      ...trucks,
      {
        id: `truck-${delIdx}-${Date.now()}`,
        totalTons: missing,
        deliveryId,
      },
    ];
  }

  const newCount = trucks.length + 1;
  const tonsPerTruck = Number((totalTons / newCount).toFixed(2));
  let accumulated = 0;

  const updatedExisting = trucks.map((truck) => {
    accumulated += tonsPerTruck;
    return { ...truck, totalTons: tonsPerTruck };
  });

  const newTruckTons = Number(Math.max(0, totalTons - accumulated).toFixed(2));

  return [
    ...updatedExisting,
    {
      id: `truck-${delIdx}-${Date.now()}`,
      totalTons: newTruckTons,
      deliveryId,
    },
  ];
}
