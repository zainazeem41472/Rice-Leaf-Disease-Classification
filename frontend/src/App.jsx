import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Upload from './components/Upload'
import Result from './components/Result'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - Requires Authentication */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/result" 
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App
