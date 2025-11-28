
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { users as mockUsers, orders as mockOrders, products as mockProducts } from '@/lib/data';
import type { Order, Product, User } from './definitions';

// AUTH ACTIONS
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const { email, password } = loginSchema.parse(Object.fromEntries(formData.entries()));
    const user = mockUsers.find((u) => u.email === email);

    // This is a mock authentication. In a real app, you'd check a hashed password.
    if (!user) {
      return 'Invalid email or password.';
    }

    const sessionData = { id: user.id, email: user.email, name: user.name, role: user.role };
    
    cookies().set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return 'Invalid form data.';
    }
    return 'Something went wrong.';
  }

  redirect('/dashboard');
}

export async function logout() {
  cookies().delete('session');
  redirect('/');
}

// Data management (mock)
let orders: Order[] = [...mockOrders];
let products: Product[] = [...mockProducts];
let users: User[] = [...mockUsers];


// USER ACTIONS
export async function getUsers() {
  return users;
}

// ORDER ACTIONS
export async function getOrders() {
  return orders;
}

export async function addOrder(order: Omit<Order, 'id'>) {
    const newId = (Math.max(...orders.map(o => parseInt(o.id)), 0) + 1).toString();
    const newOrder: Order = { ...order, id: newId };
    orders.push(newOrder);
    return newOrder;
}

export async function updateOrder(order: Order) {
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
        orders[index] = order;
        return order;
    }
    return null;
}

export async function deleteOrder(id: string) {
    orders = orders.filter(o => o.id !== id);
    return { success: true };
}


// PRODUCT ACTIONS
export async function getProducts() {
  return products;
}

export async function addProduct(product: Omit<Product, 'id'>) {
    const newId = (Math.max(...products.map(p => parseInt(p.id)), 0) + 1).toString();
    const newProduct: Product = { ...product, id: newId };
    products.push(newProduct);
    return newProduct;
}

export async function updateProduct(product: Product) {
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
        products[index] = product;
        return product;
    }
    return null;
}

export async function deleteProduct(id: string) {
    products = products.filter(p => p.id !== id);
    return { success: true };
}
