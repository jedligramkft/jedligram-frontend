import CapacitorNavigator from "./Components/Utils/NavigationManager";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./Layouts/AuthLayout";
import NavbarLayout from "./Layouts/NavbarLayout";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Home from "./Pages/Home/Home";
import Profile from "./Pages/Profile/Profile";

function App() {
  return (
    <>
      <CapacitorNavigator />
      <Routes>

        <Route element={<NavbarLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;
