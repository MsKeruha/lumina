import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import ClubList from './pages/ClubList';
import ClubDetail from './pages/ClubDetail';
import MyClubs from './pages/MyClubs';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import BookDetail from './pages/BookDetail';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/books/:bookId" element={<BookDetail />} />
              <Route path="/clubs" element={<ClubList />} />
              <Route path="/clubs/:clubId" element={<ClubDetail />} />
              <Route path="/my-clubs" element={<MyClubs />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          <footer style={{ 
            padding: '4rem 5%', 
            borderTop: '1px solid var(--glass-border)', 
            marginTop: '4rem', 
            textAlign: 'center', 
            color: '#94a3b8' 
          }}>
            <p>© 2026 Книжковий Клуб Lumina. Всі права захищені.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
