import { RouteObject, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ParentLayout from '@/layouts/ParentLayout';
import { ProtectedRoute } from './ProtectedRoute';
import ParentAttendance from '@/pages/parent/Attendance';
import ParentChildren from '@/pages/parent/Children';
import ParentFees from '@/pages/parent/Fees';
import ParentSchedule from '@/pages/parent/Schedule';
import ParentSettings from '@/pages/parent/Settings';
import ParentTimetable from '@/pages/parent/Timetable';
import ParentProfile from '@/pages/parent/Profile';

// Loading component
const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>;

// Parent pages
const ParentDashboard = lazy(() => import('@/pages/parent/Dashboard'));

export const parentRoutes: RouteObject = {
    path: '/parent',
    element: (
        <ProtectedRoute allowedRoles={['parent']} redirectPath="/login">
            <ParentLayout />
        </ProtectedRoute>
    ),
    children: [
        {
            index: true,
            element: <Navigate to="/parent/dashboard" replace />,
        },
        {
            path: 'dashboard',
            element: <ParentDashboard />,
        },
        {
            path: 'children',
            element: <ParentChildren />,
        },
        {
            path: 'attendance',
            element: <ParentAttendance />,
        },
        {
            path: 'fees',
            element: <ParentFees />,
        },
        {
            path: 'schedule',
            element: <ParentSchedule />,
        },
        {
            path: 'timetable',
            element: <ParentTimetable />,
        },
        {
            path: 'settings',
            element: <ParentSettings />,
        },
        {
            path: 'profile',
            element: <ParentProfile />,
        }
    ],
}; 