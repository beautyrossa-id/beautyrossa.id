import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import RequireAdmin from "./admin/RequireAdmin.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Website publik - TIDAK berubah sama sekali */}
        <Route path="/" element={<App />} />

        {/* Admin - Tahap A1 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrders />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
