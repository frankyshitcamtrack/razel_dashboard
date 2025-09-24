import { Routes, Route } from "react-router";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Rapport from "../pages/Rapport";
import ActiviteBase from "../pages/ActiviteBase";
import Trajet from "../pages/Trajet";
import NotFoundPage from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { FilterProvider } from "../store/GlobalFiltersContext";

function Router() {

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <FilterProvider>
                            <Dashboard />
                        </FilterProvider>

                    </ProtectedRoute>
                }
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <FilterProvider>
                            <Dashboard />
                        </FilterProvider>

                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <FilterProvider>
                            <Rapport />
                        </FilterProvider>

                    </ProtectedRoute>
                }
            />
            <Route
                path="/activity_base"
                element={
                    <ProtectedRoute>
                        <FilterProvider>
                            <ActiviteBase />
                        </FilterProvider>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/utilisation_tracteurs"
                element={
                    <ProtectedRoute>
                        <FilterProvider>
                            <Trajet />
                        </FilterProvider>

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
