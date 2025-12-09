import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AuthPage from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Room from "./Pages/RoomPage";
import Meeting from "./Pages/Meeting";
import Profile from "./Pages/Profile";
import UpdateProfile from "./Pages/UpdateProfile";
import ProtectedRoute from "./Components/PrivateRoute";
import NotFound from "./Pages/NotFound";
import DashboardLayout from "./Pages/DashboardLayout";
import TutorDashboard from "./Pages/TutorDashboard";
import TutorUpdateProfile from "./Pages/TutorUpdateProfile";
import TutorProfile from "./Pages/TutorProfile";
import PublicTutorProfile from "./Pages/PublicTutorProfile";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentFailed from "./Pages/PaymentFailed";
import StudentCalendar from "./Pages/StudentCalendar";
import TutorCalendar from "./Pages/TutorCalendar";
import Chat from "./Pages/Chat";
import ComingSoon from "./Pages/ComingSoon";

// Route logger component
function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log("Route changed:", {
      pathname: location.pathname,
      search: location.search,
      fullPath: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

const App = () => {
  return (
    <BrowserRouter>
      <RouteLogger />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />
        {/* Protected Routes */}
        {/* Layout wrapper without protection; child routes enforce role */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Meeting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard/calendar"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <TutorCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/chat"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard/chat"
            element={
              <ProtectedRoute allowedRoles={["student", "tutor"]}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard/analytics"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-dashboard/settings"
            element={
              <ProtectedRoute allowedRoles={["tutor"]}>
                <ComingSoon />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/room/:roomid"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor-profile/:id"
          element={
            <ProtectedRoute>
              <TutorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update-profile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-tutor-profile"
          element={
            <ProtectedRoute>
              <TutorUpdateProfile />
            </ProtectedRoute>
          }
        />

        {/* Payment Routes - No strict auth check to handle Stripe redirect */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/tutor/:id" element={<PublicTutorProfile />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
