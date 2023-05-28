import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CreateTask from "../components/CreateTask";
import PrivateRoute from "./PrivateRoute";

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
      <Route path='/task/:id' element={<CreateTask />} />
    </Routes>
  );
};

export default AllRoutes;
