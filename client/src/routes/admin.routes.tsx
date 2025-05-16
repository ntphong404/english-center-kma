import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import AdminClasses from '@/pages/admin/Classes';
import AdminTeachers from '@/pages/admin/Teachers';
import AdminFees from '@/pages/admin/Fees';
import AdminStudents from '@/pages/admin/Students';
import AdminReports from '@/pages/admin/Reports';
import AdminNotifications from '@/pages/admin/Notifications';
import AdminSettings from '@/pages/admin/Settings';
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
            path: 'teachers',
            element: <AdminTeachers />,
        },
        {
            path: 'students',
            element: <AdminStudents />,
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
    ],
}; 