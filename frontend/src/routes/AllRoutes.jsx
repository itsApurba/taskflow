import { Navigate, Routes, Route } from "react-router-dom";
import CreateTask from "../components/CreateTask";
import PrivateRoute from "./PrivateRoute";
import LoginForm from "../pages/LoginForm";
import SignupForm from "../pages/SignupForm";
import CreateSprint from "../components/CreateSprint";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";
import TasksPage from "../pages/TasksPage";
import SprintsPage from "../pages/SprintsPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import ProfilePage from "../pages/ProfilePage";
import MarketPage from "../pages/MarketPage";
import MarketTaskPage from "../pages/MarketTaskPage";
import PostTaskPage from "../pages/PostTaskPage";
import WalletPage from "../pages/WalletPage";
import StorePage from "../pages/StorePage";
import RedemptionsPage from "../pages/RedemptionsPage";
import PenaltiesPage from "../pages/PenaltiesPage";
import RestorePage from "../pages/RestorePage";
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
        {/* New tasks are posted to the market with a reward. */}
        <Route path='/create-task' element={<Navigate to='/market/new' replace />} />
        <Route path='/task/:id' element={<CreateTask />} />
        <Route path='/sprints' element={<SprintsPage />} />
        <Route path='/create-sprint' element={<CreateSprint />} />
        <Route path='/sprint/:id' element={<CreateSprint />} />
        <Route path='/market' element={<MarketPage />} />
        <Route path='/market/new' element={<PostTaskPage key='new' />} />
        <Route path='/market/:id' element={<MarketTaskPage />} />
        <Route path='/market/:id/edit' element={<PostTaskPage key='edit' />} />
        <Route path='/wallet' element={<WalletPage />} />
        <Route path='/store' element={<StorePage />} />
        <Route path='/store/redemptions' element={<RedemptionsPage />} />
        <Route path='/store/penalties' element={<PenaltiesPage />} />
        <Route path='/leaderboard' element={<LeaderboardPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/restore' element={<RestorePage />} />
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
