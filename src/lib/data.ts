import type { User, Order, Product } from './definitions';

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@etsyatlas.com',
    password: 'password123',
    role: 'admin',
    avatarUrl: '/avatars/01.png',
  },
  {
    id: '2',
    name: 'Store Manager',
    email: 'manager@etsyatlas.com',
    password: 'password123',
    role: 'user',
    avatarUrl: '/avatars/02.png',
  },
];

export const orders: Order[] = [
  {
    id: '1',
    etsyOrderId: 'ORD78901',
    orderDate: '2023-10-23',
    status: 'Delivered',
    orderPrice: 150.0,
    orderCost: 70.0,
    shippingCost: 15.0,
    additionalFees: 5.0,
    notes: 'Customer requested gift wrapping.',
  },
  {
    id: '2',
    etsyOrderId: 'ORD78902',
    orderDate: '2023-10-24',
    status: 'Shipped',
    orderPrice: 200.5,
    orderCost: 90.0,
    shippingCost: 20.0,
    additionalFees: 7.5,
    notes: 'Fragile item, handle with care.',
  },
  {
    id: '3',
    etsyOrderId: 'ORD78903',
    orderDate: '2023-10-25',
    status: 'Pending',
    orderPrice: 75.25,
    orderCost: 30.0,
    shippingCost: 10.0,
    additionalFees: 2.25,
    notes: '',
  },
  {
    id: '4',
    etsyOrderId: 'ORD78904',
    orderDate: '2023-10-26',
    status: 'Delivered',
    orderPrice: 350.0,
    orderCost: 150.0,
    shippingCost: 30.0,
    additionalFees: 15.0,
    notes: '',
  },
  {
    id: '5',
    etsyOrderId: 'ORD78905',
    orderDate: '2023-11-01',
    status: 'Cancelled',
    orderPrice: 55.0,
    orderCost: 25.0,
    shippingCost: 5.0,
    additionalFees: 1.0,
    notes: 'Customer cancelled due to wrong address.',
  },
  {
    id: '6',
    etsyOrderId: 'ORD78906',
    orderDate: '2023-11-05',
    status: 'Shipped',
    orderPrice: 120.0,
    orderCost: 60.0,
    shippingCost: 12.0,
    additionalFees: 4.0,
    notes: '',
  },
  {
    id: '7',
    etsyOrderId: 'ORD78907',
    orderDate: '2023-11-10',
    status: 'Pending',
    orderPrice: 89.99,
    orderCost: 45.0,
    shippingCost: 8.0,
    additionalFees: 3.5,
    notes: 'Awaiting payment confirmation.',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Handmade Ceramic Mug',
    category: 'Home Goods',
    price: 25.0,
    stock: 50,
    imageUrl: 'https://picsum.photos/seed/product1/400/400',
    imageHint: 'ceramic mug'
  },
  {
    id: '2',
    name: 'Knitted Winter Scarf',
    category: 'Accessories',
    price: 45.0,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/product2/400/400',
    imageHint: 'knitted scarf'
  },
  {
    id: '3',
    name: 'Personalized Leather Wallet',
    category: 'Accessories',
    price: 60.0,
    stock: 20,
    imageUrl: 'https://picsum.photos/seed/product3/400/400',
    imageHint: 'leather wallet'
  },
  {
    id: '4',
    name: 'Botanical Art Print',
    category: 'Art & Collectibles',
    price: 30.0,
    stock: 100,
    imageUrl: 'https://picsum.photos/seed/product4/400/400',
    imageHint: 'art print'
  },
  {
    id: '5',
    name: 'Soy Wax Scented Candle',
    category: 'Home Goods',
    price: 22.5,
    stock: 75,
    imageUrl: 'https://picsum.photos/seed/product5/400/400',
    imageHint: 'scented candle'
  },
];
