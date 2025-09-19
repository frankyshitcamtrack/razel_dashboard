import { Routes, Route } from "react-router";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Rapport from "../pages/Rapport";
import ActiviteBase from "../pages/ActiviteBase";
import NotFoundPage from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";

function Router() {

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Rapport />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/activity_base"
                element={
                    <ProtectedRoute>
                        <ActiviteBase />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/*"
                element={

                    <NotFoundPage />

                }
            />
        </Routes>
    );
}

export default Router;
