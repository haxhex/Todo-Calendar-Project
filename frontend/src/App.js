import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import LoginReg from "./pages/auth/LoginReg";
import SendPasswordResetEmail from "./pages/auth/SendPasswordResetEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import EditProfile from "./pages/auth/EditProfile";
import ChangePassword from "./pages/auth/ChangePassword";
import TaskManager from "./pages/TaskManager";
import Task from "./components/Task";
import MyCalendar from "./components/MyCalendar";
import { useSelector } from "react-redux";
import TaskList from './pages/TaskList';
import TaskListPage from './pages/TaskListPage';
import ReportPage from './pages/ReportPage';
import "./fonts/Shabnam.ttf";

function App() {
  const { access_token } = useSelector((state) => state.auth);
  // Save the current location to localStorage only if the user is not authenticated

  // Get the stored location from localStorage
  let lastLocation = localStorage.getItem('lastLocation');
  console.log('lastLocation: ', lastLocation)
  if (lastLocation == null) {
    lastLocation = "/dashboard";
  }
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
            <Route index element={<LoginReg />} />
            <Route path="login" element={!access_token ? <LoginReg /> : <Navigate to={lastLocation} />} />
            <Route path="sendpasswordresetemail" element={<SendPasswordResetEmail />} />
            <Route path="sendpasswordresetemail" element={<SendPasswordResetEmail />} />
            <Route path="api/user/reset/:id/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={access_token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={access_token ? <Calendar /> : <Navigate to="/login" />} />
            <Route path="/tasklist" element={access_token ? <TaskList /> : <Navigate to="/login" />} />
            <Route path="edit-profile" element={access_token ? <EditProfile /> : <Navigate to="/login" />} /> 
            <Route path="/change-password" element={access_token ? <ChangePassword /> : <Navigate to="/login" />} /> 
            <Route path="/task-manager"element={access_token ? <TaskManager /> : <Navigate to="/login" />} />
            <Route path="/task" element={access_token ? <Task /> : <Navigate to="/login" />} />
            <Route path="/mycalendar" element={<MyCalendar />} />
            <Route path="/task-lists/:id/:listname" element={access_token ? <TaskListPage /> : <Navigate to="/login" />} />
            <Route path="/report" element={access_token ? <ReportPage /> : <Navigate to="/login" />} />
        </Route>
          <Route path="*" element={<h1>Error 404 Page not found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
