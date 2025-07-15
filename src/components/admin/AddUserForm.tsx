// AddUserForm.tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'staff']),
});

export type UserFormData = z.infer<typeof baseSchema> & { password?: string };

interface AddUserFormProps {
  user?: any;           // existing user when editing
  onSuccess?: () => void;
}

export const AddUserForm: React.FC<AddUserFormProps> = ({ user, onSuccess }) => {
  const api = useApi();
  const { toast } = useToast();

  const isEdit = Boolean(user?._id);

  // password: required only on "add"
  const schema = isEdit
    ? baseSchema.extend({ password: z.string().optional() })
    : baseSchema.extend({
        password: z.string().min(6, 'Password must be at least 6 characters'),
      });

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'staff',
      password: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit) {
        // Don’t send empty passwords when editing
        const payload = data.password ? data : { ...data, password: undefined };
        await api.put(`/users/${user._id}`, payload);
        toast({ title: 'Updated', description: 'User updated successfully' });
      } else {
        await api.post('/users', data);
        toast({ title: 'Created', description: 'User created successfully' });
      }
      onSuccess?.();
      form.reset();
    } catch {
      toast({
        title: 'Error',
        description: isEdit ? 'Failed to update user' : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="rounded-2xl border bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEdit ? 'Edit User' : 'Add New User'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* password: hide during edit unless user types something */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password{isEdit && ' (leave blank to keep existing)'}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
