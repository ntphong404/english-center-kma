import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Teacher pages
const TeacherDashboard = lazy(() => import('@/pages/teacher/Dashboard'));
const TeacherClasses = lazy(() => import('@/pages/teacher/Classes'));
const TeacherSchedule = lazy(() => import('@/pages/teacher/Schedule'));
const TeacherAttendance = lazy(() => import('@/pages/teacher/Attendance'));
const TeacherSettings = lazy(() => import('@/pages/teacher/Settings'));

export const teacherRoutes: RouteObject = {
    path: '/teacher',
    element: (
        <ProtectedRoute allowedRoles={['teacher']} redirectPath="/login">
            <TeacherLayout />
        </ProtectedRoute>
    ),
    children: [
        {
            index: true,
            element: <Navigate to="/teacher/dashboard" replace />,
        },
        {
            path: 'dashboard',
            element: <TeacherDashboard />,
        },
        {
            path: 'classes',
            element: <TeacherClasses />,
        },
        {
            path: 'schedule',
            element: <TeacherSchedule />,
        },
        {
            path: 'attendance',
            element: <TeacherAttendance />,
        },
        {
            path: 'settings',
            element: <TeacherSettings />,
        },
    ],
}; 