import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { User as UserIcon, Mail, Lock, ArrowLeft } from 'lucide-react';
import { getUser, setUser } from '@/store/userStore';
import axios from 'axios';
import authApi from '@/api/authApi';
import { LoginRequest } from '@/types/auth';

// Define form schema
const formSchema = z.object({
  username: z.string().min(1, { message: 'Vui lòng nhập tên đăng nhập' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP phải có 6 ký tự' }),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type OtpValues = z.infer<typeof otpSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'password'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    }
  });

  const resetPasswordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
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

  const onForgotPasswordSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setUserEmail(data.email);
      setForgotPasswordStep('otp');
      toast({
        title: 'Thành công',
        description: 'Mã OTP đã được gửi đến email của bạn',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi mã OTP. Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpValues) => {
    setIsLoading(true);
    try {
      await authApi.verifyOtp({ email: userEmail, otpCode: data.otp });
      setOtpCode(data.otp);
      setForgotPasswordStep('password');
      toast({
        title: 'Thành công',
        description: 'Mã OTP hợp lệ',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Mã OTP không đúng. Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: userEmail,
        otpCode: otpCode,
        newPassword: data.newPassword
      });
      toast({
        title: 'Thành công',
        description: 'Mật khẩu đã được đặt lại thành công',
      });
      setShowForgotPassword(false);
      setForgotPasswordStep('email');
      setUserEmail('');
      setOtpCode('');
      forgotPasswordForm.reset();
      otpForm.reset();
      resetPasswordForm.reset();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đặt lại mật khẩu. Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setForgotPasswordStep('email');
    otpForm.reset();
  };

  const handleBackToOtp = () => {
    setForgotPasswordStep('otp');
    resetPasswordForm.reset();
  };

  return (
    <>
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

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Quên mật khẩu?
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Quên mật khẩu
            </DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === 'email' && 'Nhập email để nhận mã OTP'}
              {forgotPasswordStep === 'otp' && 'Nhập mã OTP đã được gửi đến email'}
              {forgotPasswordStep === 'password' && 'Đặt mật khẩu mới'}
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordStep === 'email' && (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập email của bạn" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Đang gửi...' : 'Gửi OTP'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {forgotPasswordStep === 'otp' && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã OTP</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã 6 số" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBackToEmail} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {forgotPasswordStep === 'password' && (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Nhập mật khẩu mới" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBackToOtp} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
