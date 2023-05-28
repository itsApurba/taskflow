import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CreateTask from "../components/CreateTask";
import PrivateRoute from "./PrivateRoute";
import LoginForm from "../pages/LoginForm";
import SignupForm from "../pages/SignupForm";
import CreateSprint from "../components/CreateSprint";

const AllRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route
        path='/dashboard'
        element={
          <PrivateRoute>
            <HomePage />
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
      <Route path='/login' element={<LoginForm />} />
      <Route path='/signup' element={<SignupForm />} />
      <Route path='/task/:id' element={<CreateTask />} />
      <Route path='*' element={<HomePage />} />
    </Routes>
  );
};

export default AllRoutes;
