import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { ProtectedRoute } from './ProtectedRoute';
import StudentAttendance from '@/pages/student/Attendance';
import StudentFees from '@/pages/student/Fees';
import StudentSchedule from '@/pages/student/Schedule';
import StudentSettings from '@/pages/student/Settings';
import StudentProfile from '@/pages/student/Profile';

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));

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
            path: 'attendance',
            element: <StudentAttendance />,
        },
        {
            path: 'fees',
            element: <StudentFees />,
        },
        {
            path: 'schedule',
            element: <StudentSchedule />,
        },
        {
            path: 'settings',
            element: <StudentSettings />,
        },
        {
            path: 'profile',
            element: <StudentProfile />,
        }
    ],
}; 