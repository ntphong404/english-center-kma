import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import AdminClasses from '@/pages/admin/Classes';
import AdminFees from '@/pages/admin/Fees';
import AdminReports from '@/pages/admin/Reports';
import AdminNotifications from '@/pages/admin/Notifications';
import AdminSettings from '@/pages/admin/Settings';
import Users from '@/pages/admin/Users';
import Banner from '@/pages/admin/Banner';
import AdminProfile from '@/pages/admin/Profile';
// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

export const adminRoutes: RouteObject = {
    path: '/admin',
    element: (
        <ProtectedRoute allowedRoles={['admin']} redirectPath="/login">
            <AdminLayout />
        </ProtectedRoute>
    ),
    children: [
        {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
        },
        {
            path: 'dashboard',
            element: <AdminDashboard />,
        },
        {
            path: 'classes',
            element: <AdminClasses />,
        },
        {
            path: 'users',
            element: <Users />,
        },
        {
            path: 'fees',
            element: <AdminFees />,
        },
        {
            path: 'reports',
            element: <AdminReports />,
        },
        {
            path: 'notifications',
            element: <AdminNotifications />,
        },
        {
            path: 'settings',
            element: <AdminSettings />,
        },
        {
            path: 'banner',
            element: <Banner />,
        },
        {
            path: 'profile',
            element: <AdminProfile />,
        }
    ],
}; 