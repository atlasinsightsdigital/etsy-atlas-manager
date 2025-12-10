'use client';

import { useState, useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { DataTable } from '@/components/dashboard/users/data-table';
import { columns } from '@/components/dashboard/users/columns';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Shield, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserForm } from '@/components/dashboard/users/user-form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllUsers } from '@/lib/actions';
import { useEffect } from 'react';

export default function UsersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [usersStats, setUsersStats] = useState({
    total: 0,
    admins: 0,
    regularUsers: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch users statistics
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const users = await getAllUsers();
        const admins = users.filter(user => user.role === 'admin').length;
        const regularUsers = users.filter(user => user.role === 'user').length;
        
        setUsersStats({
          total: users.length,
          admins,
          regularUsers,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error loading user statistics',
          description: (error as Error).message,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [toast]);

  // Create memoized query for users
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    const usersCollection = collection(firestore, 'users');
    let q = query(usersCollection, orderBy('createdAt', 'desc'));
    
    // Apply role filter if not "all"
    if (roleFilter !== 'all') {
      // Note: This requires appropriate Firestore indexes
      return q;
    }
    
    return q;
  }, [firestore, roleFilter]);

  const { data: users, isLoading, error } = useCollection(usersQuery);

  // Handle errors
  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error loading users',
      description: error.message,
    });
  }

  // Filter users client-side
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (roleFilter === 'all') return users;
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions for your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for your business.
                </DialogDescription>
              </DialogHeader>
              <UserForm setOpen={setIsAddDialogOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                usersStats.total
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                usersStats.admins
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                usersStats.regularUsers
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with standard access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <DataTable columns={columns} data={filteredUsers} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {roleFilter !== 'all' 
              ? `No ${roleFilter} users found.`
              : 'No users found. Add your first user!'}
          </div>
        )}
      </div>
    </div>
  );
}
