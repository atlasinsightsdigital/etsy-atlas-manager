
export type User = {
  id: string; // This will serve as the uid
  name: string; // This will serve as the displayName
  email: string;
  role: 'admin' | 'user';
  createdAt: string; // Using string to represent timestamp for simplicity
};

export type Order = {
  id: string;
  etsyOrderId: string;
  orderDate: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderPrice: number;
  orderCost: number;
  shippingCost: number;
  additionalFees: number;
  notes?: string;
  trackingNumber?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageHint: string;
};
