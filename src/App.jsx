import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CreditsProvider } from './contexts/CreditsContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './components/Landing'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import AIAssistant from './components/dashboard/AIAssistant'
import Settings from './components/dashboard/Settings'
import UsageStats from './components/dashboard/UsageStats'
import ModelSwitching from './components/dashboard/ModelSwitching'
import Privacy from './components/dashboard/Privacy'
import Help from './components/dashboard/Help'
import Billing from './components/dashboard/Billing'

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CreditsProvider>
            <div className="app">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/ai-assistant" 
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/usage-stats" 
              element={
                <ProtectedRoute>
                  <UsageStats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/model-switching" 
              element={
                <ProtectedRoute>
                  <ModelSwitching />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/privacy" 
              element={
                <ProtectedRoute>
                  <Privacy />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/help" 
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CreditsProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  )
}