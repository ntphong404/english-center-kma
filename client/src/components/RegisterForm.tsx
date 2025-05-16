import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

// Define form schema
const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Vui lòng nhập họ tên' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  phone: z.string().min(10, { message: 'Số điện thoại không hợp lệ' }),
  childAge: z.string().min(1, { message: 'Vui lòng nhập tuổi của con' }),
  courseInterest: z.string().min(1, { message: 'Vui lòng chọn khóa học quan tâm' }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Bạn phải đồng ý với điều khoản dịch vụ',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      childAge: '',
      courseInterest: '',
      acceptTerms: false,
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Registration data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast({
        title: 'Đăng ký thành công',
        description: 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: 'Đăng ký thất bại',
        description: 'Đã xảy ra lỗi, vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập họ tên" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Nhập email" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="childAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuổi của con</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tuổi của con" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="courseInterest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khóa học quan tâm</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Tiếng Anh cơ bản (4-6 tuổi)</SelectItem>
                    <SelectItem value="intermediate">Tiếng Anh giao tiếp (7-9 tuổi)</SelectItem>
                    <SelectItem value="advanced">Tiếng Anh học thuật (10-12 tuổi)</SelectItem>
                    <SelectItem value="ielts">Luyện thi chứng chỉ quốc tế</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký nhận thông tin'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
