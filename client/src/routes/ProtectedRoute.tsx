import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, getUserRole } from '@/store/userStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    redirectPath?: string;
}

export const ProtectedRoute = ({
    children,
    allowedRoles = [],
    redirectPath = "/login"
}: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const userData = getUser();
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

            if (userData) {
                setIsAuthenticated(isAuthenticated);
                setUserRole(getUserRole());
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated || (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole))) {
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
}; 