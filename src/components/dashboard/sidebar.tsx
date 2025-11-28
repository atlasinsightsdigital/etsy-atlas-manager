
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/dashboard/products',
      label: 'Products',
      icon: Package,
    },
    {
      href: '/dashboard/capital',
      label: 'Capital',
      icon: Landmark,
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
    },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-8 w-8 text-primary"
                >
                <rect width="256" height="256" fill="none" />
                <path
                    d="M32,184.2,125.7,56.9a8,8,0,0,1,12.6,0L224,184.2a8.1,8.1,0,0,1-6.3,12.3H38.3A8.1,8.1,0,0,1,32,184.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                />
                <line
                    x1="128"
                    y1="216"
                    x2="128"
                    y2="24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                />
            </svg>
          <span className="text-lg font-semibold tracking-tight">Etsy Atlas</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Button
                asChild
                variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'default' : 'ghost'}
                className="w-full justify-start"
                aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
