import { Routes, Route } from "react-router-dom";
import CreateTask from "../components/CreateTask";
import PrivateRoute from "./PrivateRoute";
import LoginForm from "../pages/LoginForm";
import SignupForm from "../pages/SignupForm";
import CreateSprint from "../components/CreateSprint";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";
import TasksPage from "../pages/TasksPage";
import SprintsPage from "../pages/SprintsPage";
import ComingSoonPage from "../pages/ComingSoonPage";
import WalletPage from "../pages/WalletPage";
import StorePage from "../pages/StorePage";
import RedemptionsPage from "../pages/RedemptionsPage";
import PenaltiesPage from "../pages/PenaltiesPage";
import AppShell from "../components/shell/AppShell";
import AuthLayout from "../components/shell/AuthLayout";

const AllRoutes = () => {
  return (
    <Routes>
      {/* Signed-in screens share the app shell (sidebar, top bar, tab bar). */}
      <Route
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route path='/' element={<Dashboard />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/tasks' element={<TasksPage />} />
        <Route path='/create-task' element={<CreateTask />} />
        <Route path='/task/:id' element={<CreateTask />} />
        <Route path='/sprints' element={<SprintsPage />} />
        <Route path='/create-sprint' element={<CreateSprint />} />
        <Route path='/sprint/:id' element={<CreateSprint />} />
        {/* Placeholders until the game screens are built; replace each with its page. */}
        <Route path='/market' element={<ComingSoonPage key='market' feature='market' />} />
        <Route path='/wallet' element={<WalletPage />} />
        <Route path='/store' element={<StorePage />} />
        <Route path='/store/redemptions' element={<RedemptionsPage />} />
        <Route path='/store/penalties' element={<PenaltiesPage />} />
        <Route path='/leaderboard' element={<ComingSoonPage key='leaderboard' feature='leaderboard' />} />
        <Route path='/profile' element={<ComingSoonPage key='profile' feature='profile' />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path='/login' element={<LoginForm />} />
        <Route path='/signup' element={<SignupForm />} />
        <Route path='*' element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default AllRoutes;
