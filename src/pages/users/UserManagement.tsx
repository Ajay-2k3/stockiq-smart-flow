import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { UserCard } from '@/components/ui/user-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddUserForm } from '@/components/admin/AddUserForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdBy?: { name: string };
}

export default function UserManagement() {
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /** ------------ Fetch Users ------------- */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Add cache-busting param to avoid 304 empty body issue
      const response = await api.get(`/users?_=${Date.now()}`);
      setUsers(Array.isArray(response.users) ? response.users : []);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /** ------------ Filtered Users ------------- */
  const filteredUsers = users.filter((u) =>
    `${u.name}${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** ------------ UI ------------- */
  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setEditingUser(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>

            <AddUserForm
              user={editingUser ?? undefined}
              onSuccess={() => {
                fetchUsers();
                setIsDialogOpen(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onEdit={(u) => {
              setEditingUser(u);
              setIsDialogOpen(true);
            }}
            onDelete={async (id) => {
              if (!confirm('Delete this user?')) return;
              try {
                await api.del(`/users/${id}`);
                toast.success('User deleted');
                fetchUsers();
              } catch {
                toast.error('Failed to delete user');
              }
            }}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No users found.</div>
      )}
    </div>
  );
}
