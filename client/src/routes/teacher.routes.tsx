import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { ProtectedRoute } from './ProtectedRoute';
import TeacherClasses from '@/pages/teacher/Classes';
import TeacherAttendance from '@/pages/teacher/Attendance';
import TeacherSchedule from '@/pages/teacher/Schedule';
import TeacherSettings from '@/pages/teacher/Settings';
import TeacherProfile from '@/pages/teacher/Profile';

// Teacher pages
const TeacherDashboard = lazy(() => import('@/pages/teacher/Dashboard'));

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
            path: 'attendance',
            element: <TeacherAttendance />,
        },
        {
            path: 'schedule',
            element: <TeacherSchedule />,
        },
        {
            path: 'settings',
            element: <TeacherSettings />,
        },
        {
            path: 'profile',
            element: <TeacherProfile />,
        }
    ],
}; 