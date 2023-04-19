import './App.css';
import { Navigate,  Route, Routes } from 'react-router-dom';
import Header from './layout/header/Header';
import JobsPage from './pages/jobs/Jobs';
import JobDetailsPage from './pages/jobDetails/JobDetails';
import SignupPage from './pages/signup/Signup';
import LoginPage from './pages/login/Login';
import AdminPanelPage from './pages/adminPanel/AdminPanel';

export default function App() {

  return <>
      <Header/>
        <Routes>
          <Route path="/" element={<Navigate to="/jobs" />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/job/:jobId" element={<JobDetailsPage />} />
          <Route path="/admin-panel" element={<AdminPanelPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
    </>
  ;
}
