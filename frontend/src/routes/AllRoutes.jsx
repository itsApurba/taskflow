import { Routes, Route } from "react-router-dom";
import CreateTask from "../components/CreateTask";
import PrivateRoute from "./PrivateRoute";
import LoginForm from "../pages/LoginForm";
import SignupForm from "../pages/SignupForm";
import CreateSprint from "../components/CreateSprint";
import UserDashboard from "../components/UserDashboard";
import HomePage from "../pages/HomePage";

const AllRoutes = () => {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path='/sprint/:id'
        element={
          <PrivateRoute>
            <CreateSprint />
          </PrivateRoute>
        }
      />
      <Route
        path='/dashboard'
        element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path='/create-task'
        element={
          <PrivateRoute>
            <CreateTask />
          </PrivateRoute>
        }
      />
      <Route
        path='/create-sprint'
        element={
          <PrivateRoute>
            <CreateSprint />
          </PrivateRoute>
        }
      />
      <Route
        path='/task/:id'
        element={
          <PrivateRoute>
            <CreateTask />
          </PrivateRoute>
        }
      />
      <Route path='/login' element={<LoginForm />} />
      <Route path='/signup' element={<SignupForm />} />
      <Route path='*' element={<HomePage />} />
    </Routes>
  );
};

export default AllRoutes;
