import { Route, Routes } from 'react-router-dom'
import AuthLayout from './Layouts/AuthLayout'
import MainLayout from './Layouts/MainLayout'
import Login from './Pages/Auth/Login'
import Register from './Pages/Auth/Register'
import Home from './Pages/Home/Home'
import Profile from './Pages/Profile/Profile'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>

      <Route path='auth' element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
      </Route>

      <Route path='profile' element={<MainLayout />}>
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App