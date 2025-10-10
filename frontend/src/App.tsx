import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Room from "./Pages/RoomPage";
import Meeting from "./Pages/Meeting";
import Profile from "./Pages/Profile";
import UpdateProfile from "./Pages/UpdateProfile";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Room from "./Pages/RoomPage";
import Meeting from "./Pages/Meeting";
import Profile from "./Pages/Profile";
import UpdateProfile from "./Pages/UpdateProfile";
import PrivateRoute from "./Component/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />}></Route>

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/room/:roomid"
          element={
            <PrivateRoute>
              <Room />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/meeting"
          element={
            <PrivateRoute>
              <Meeting />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        ></Route>
        <Route
          path="/update-profile"
          element={
            <PrivateRoute>
              <UpdateProfile />
            </PrivateRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
