import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Public Pages (Eagerly loaded)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Search from './pages/Search';
import HotelDetails from './pages/HotelDetails';
import NotFound from './pages/NotFound';

// Lazy loaded pages
const Profile = React.lazy(() => import('./pages/Profile'));
const Booking = React.lazy(() => import('./pages/Booking'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));

// Manager Dashboards (Lazy)
const ManagerDashboard = React.lazy(() => import('./pages/manager/Dashboard'));
const MyHotels = React.lazy(() => import('./pages/manager/MyHotels'));
const HotelForm = React.lazy(() => import('./pages/manager/HotelForm'));
const Rooms = React.lazy(() => import('./pages/manager/Rooms'));
const RoomForm = React.lazy(() => import('./pages/manager/RoomForm'));

// Admin Dashboards (Lazy)
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Users = React.lazy(() => import('./pages/admin/Users'));
const AdminHotels = React.lazy(() => import('./pages/admin/Hotels'));
const AdminBookings = React.lazy(() => import('./pages/admin/Bookings'));

const FallbackLoader = () => (
  <div style={{ padding: '4rem', textAlign: 'center', minHeight: '50vh' }}>Loading...</div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<FallbackLoader />}>
              <Routes>
                <Route element={<Layout />}>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/hotel/:id" element={<HotelDetails />} />

                  {/* Protected Routes (Logged In Users) */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/book/:id" element={<Booking />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                  </Route>

                  {/* Manager Dashboards */}
                  <Route element={<RoleRoute roles={['manager', 'admin']} />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/manager" element={<ManagerDashboard />} />
                      <Route path="/manager/hotels" element={<MyHotels />} />
                      <Route path="/manager/hotel/new" element={<HotelForm />} />
                      <Route path="/manager/hotel/:hotelId/edit" element={<HotelForm />} />
                      <Route path="/manager/hotel/:hotelId/rooms" element={<Rooms />} />
                      <Route path="/manager/hotel/:hotelId/rooms/new" element={<RoomForm />} />
                      <Route path="/manager/hotel/:hotelId/rooms/:roomId/edit" element={<RoomForm />} />
                    </Route>
                  </Route>

                  {/* Admin Dashboards */}
                  <Route element={<RoleRoute roles={['admin']} />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<Users />} />
                      <Route path="/admin/hotels" element={<AdminHotels />} />
                      <Route path="/admin/bookings" element={<AdminBookings />} />
                    </Route>
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
