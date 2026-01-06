import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * ProtectedRoute component that redirects unauthenticated users to login
 * Wraps protected routes and checks authentication status
 */
export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render child routes if authenticated
    return <Outlet />;
};
