import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MaterialsList from "./pages/MaterialsList";
import MaterialDetail from "./pages/MaterialDetail";
import PurchaseRequestCreate from "./pages/PurchaseRequestCreate";
import PurchaseRequestList from "./pages/PurchaseRequestList";
import StockInflowLog from "./pages/StockInflowLog";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/materials" element={<MaterialsList />} />
        <Route path="/materials/:id" element={<MaterialDetail />} />
        <Route path="/purchase-requests" element={<PurchaseRequestList />} />
        <Route path="/purchase-requests/new" element={<PurchaseRequestCreate />} />
        <Route path="/stock-inflow" element={<StockInflowLog />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
