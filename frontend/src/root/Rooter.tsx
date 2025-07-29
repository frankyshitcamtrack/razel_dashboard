import { Routes, Route } from "react-router";
import Dashboard from "../pages/Dashboard";
import Rapport from "../pages/Rapport";
import NotFoundPage from "../pages/NotFound";

function Router() {


    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Rapport />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default Router;
