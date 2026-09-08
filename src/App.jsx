import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import Bookings from "./pages/Bookings";
import Equipment from "./pages/Equipment";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import BookingDetail from "./pages/BookingDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/bookings"
            element={<Bookings />}
          />
          <Route
            path="/bookings/:orderNumber"
            element={<BookingDetail />}
          />
          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/equipment"
            element={<Equipment />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}