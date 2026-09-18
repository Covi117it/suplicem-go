import { Order } from "./orders";

export type TripStatus =
  | "available"
  | "accepted"
  | "started"
  | "in_progress"
  | "completed"
  | "canceled";

export interface Trip {
  id: string;
  tripNumber: string;
  orderIds?: string[];
  orders?: Order[];
  totalTons: number;
  status?: TripStatus | string;
  assignedDriverId?: string;
  driverId?: string;
  driver?: any;
  comments?: string;
  createdAt: string;
  acceptedAt?: string;
}
