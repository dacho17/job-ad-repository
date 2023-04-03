import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './layout/header/Header';
import JobsPage from './pages/jobs/Jobs';
import HomePage from './pages/home/Home';

export default function App() {
  return <>
      <Header/>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Routes>
    </>
  ;
}
