import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));
const StudentClasses = lazy(() => import('@/pages/student/Classes'));
const StudentSchedule = lazy(() => import('@/pages/student/Schedule'));
const StudentAttendance = lazy(() => import('@/pages/student/Attendance'));
const StudentSettings = lazy(() => import('@/pages/student/Settings'));

export const studentRoutes: RouteObject = {
    path: '/student',
    element: (
        <ProtectedRoute allowedRoles={['student']} redirectPath="/login">
            <StudentLayout />
        </ProtectedRoute>
    ),
    children: [
        {
            index: true,
            element: <Navigate to="/student/dashboard" replace />,
        },
        {
            path: 'dashboard',
            element: <StudentDashboard />,
        },
        {
            path: 'classes',
            element: <StudentClasses />,
        },
        {
            path: 'schedule',
            element: <StudentSchedule />,
        },
        {
            path: 'attendance',
            element: <StudentAttendance />,
        },
        {
            path: 'settings',
            element: <StudentSettings />,
        },
    ],
}; 