import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

const AppRoutes = () => {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;