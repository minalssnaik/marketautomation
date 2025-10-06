import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Dashboard from "./components/Dashboard";
import ParameterSelection from "./components/ParameterSelection";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentParameterId, setCurrentParameterId] = useState(null);
  
  // Check for existing parameters on load
  useEffect(() => {
    const savedParameterId = localStorage.getItem('currentParameterId');
    if (savedParameterId) {
      setCurrentParameterId(savedParameterId);
    }
  }, []);

  const handleParametersSelected = (parameterId) => {
    setCurrentParameterId(parameterId);
    localStorage.setItem('currentParameterId', parameterId);
    toast.success("Parameters saved! Generating insights...", {
      duration: 3000,
    });
  };

  const handleReset = () => {
    setCurrentParameterId(null);
    localStorage.removeItem('currentParameterId');
    toast.info("Dashboard reset. Select new parameters.", {
      duration: 2000,
    });
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              currentParameterId ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ParameterSelection onParametersSelected={handleParametersSelected} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentParameterId ? (
                <Dashboard 
                  parameterId={currentParameterId} 
                  onReset={handleReset}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="bottom-right"
        richColors
      />
    </div>
  );
}

export default App;