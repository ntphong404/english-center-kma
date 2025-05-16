import { RouteObject, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ParentLayout from '@/layouts/ParentLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Loading component
const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>;

// Parent pages
const ParentDashboard = lazy(() => import('@/pages/parent/Dashboard'));
const ParentChildren = lazy(() => import('@/pages/parent/Children'));
const ParentSchedule = lazy(() => import('@/pages/parent/Schedule'));
const ParentTimetable = lazy(() => import('@/pages/parent/Timetable'));
const ParentClasses = lazy(() => import('@/pages/parent/Classes'));
const ParentFees = lazy(() => import('@/pages/parent/Fees'));
const ParentSettings = lazy(() => import('@/pages/parent/Settings'));

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
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentDashboard />
                </Suspense>
            ),
        },
        {
            path: 'children',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentChildren />
                </Suspense>
            ),
        },
        {
            path: 'schedule',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentSchedule />
                </Suspense>
            ),
        },
        {
            path: 'timetable',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentTimetable />
                </Suspense>
            ),
        },
        {
            path: 'classes',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentClasses />
                </Suspense>
            ),
        },
        {
            path: 'fees',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentFees />
                </Suspense>
            ),
        },
        {
            path: 'settings',
            element: (
                <Suspense fallback={<Loading />}>
                    <ParentSettings />
                </Suspense>
            ),
        },
    ],
}; 