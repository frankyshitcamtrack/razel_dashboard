import { useAuth } from '../store/AuthContext';
import Router from './Rooter';
import LoginPage from '../pages/LoginPage';
import { VehicleLoadingSpinner } from '../components/UI/LoadingSpinner';

const AuthRouter = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className='w-full h-full flex justify-center items-center'><VehicleLoadingSpinner /></div>;
    }

    return isAuthenticated ? <Router /> : <LoginPage />;
};

export default AuthRouter;


