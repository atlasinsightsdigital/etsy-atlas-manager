import type { User, Order, CapitalEntry } from './definitions';

export const users: Omit<User, 'id' | 'createdAt'>[] = [
  {
    name: 'Admin User',
    email: 'admin@etsyatlas.com',
    role: 'admin',
  },
  {
    name: 'Sophia Williams',
    email: 'sophia.w@example.com',
    role: 'user',
  },
];

export const orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderDate'>[] = [
    {
        etsyOrderId: "ORD12345",
        status: "Delivered",
        orderPrice: 120.50,
        orderCost: 45.00,
        shippingCost: 12.50,
        additionalFees: 3.00,
        trackingNumber: "1Z999AA10123456789",
        notes: "Customer requested gift wrapping."
    },
    {
        etsyOrderId: "ORD54321",
        status: "Shipped",
        orderPrice: 75.00,
        orderCost: 25.00,
        shippingCost: 10.00,
        additionalFees: 1.50,
        trackingNumber: "1Z999AA10198765432"
    },
    {
        etsyOrderId: "ORD67890",
        status: "Pending",
        orderPrice: 250.00,
        orderCost: 110.00,
        shippingCost: 25.00,
        additionalFees: 10.00,
    },
    {
        etsyOrderId: "ORD09876",
        status: "Cancelled",
        orderPrice: 50.00,
        orderCost: 20.00,
        shippingCost: 8.00,
        additionalFees: 0,
        notes: "Customer cancelled, accidental purchase."
    }
];

export const capitalEntries: CapitalEntry[] = [];
