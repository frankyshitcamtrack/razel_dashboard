
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import type { ReactElement } from "react";

type ProtectedRouteProps = {
    children: ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div>Chargement...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};
