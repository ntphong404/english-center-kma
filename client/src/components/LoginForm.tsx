import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User as UserIcon } from 'lucide-react';
import { getUser, setUser } from '@/store/userStore';
import axios from 'axios';
import authApi from '@/api/authApi';
import { LoginRequest } from '@/types/auth';

// Define form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Vui lòng nhập tên đăng nhập' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const onSubmit = async (formData: FormValues) => {
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        username: formData.username,
        password: formData.password
      };
      const loginResponse = await authApi.login(loginData);

      // Show success message
      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng quay trở lại!`,
      });

      // Redirect based on role
      switch (loginResponse.user.role.toLowerCase()) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        default:
          navigate('/');
      }

    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Tên đăng nhập hoặc mật khẩu không đúng',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <UserIcon className="w-6 h-6 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên đăng nhập" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Nhập mật khẩu" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
