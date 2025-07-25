import { useAuth } from '../store/AuthContext';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/LoginPage';
import { VehicleLoadingSpinner } from '../components/UI/LoadingSpinner';

const AuthRouter = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <VehicleLoadingSpinner />;
    }

    return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

export default AuthRouter;


