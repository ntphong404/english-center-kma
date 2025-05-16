import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Public pages
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Index />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]; 