import { useAuth } from '../store/AuthContext';
import Router from './Rooter';
import LoginPage from '../pages/LoginPage';
import { VehicleLoadingSpinner } from '../components/UI/LoadingSpinner';

const AuthRouter = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <VehicleLoadingSpinner />;
    }

    return isAuthenticated ? <Router /> : <LoginPage />;
};

export default AuthRouter;


