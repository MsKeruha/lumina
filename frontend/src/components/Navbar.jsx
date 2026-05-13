import React, { useState } from 'react';
import { BookOpen, Search, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="glass-nav">
      <Link to="/" className="logo">
        <BookOpen size={32} />
        <span>Lumina</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Головна</Link>
        <Link to="/discover" className={`nav-link ${location.pathname === '/discover' ? 'active' : ''}`}>Дослідити</Link>
        <Link to="/my-clubs" className={`nav-link ${location.pathname === '/my-clubs' ? 'active' : ''}`}>Мої Клуби</Link>
        <Link to="/community" className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}>Спільнота</Link>
        <Link to="/tech" className={`nav-link ${location.pathname === '/tech' ? 'active' : ''}`}>Алгоритми</Link>
      </div>

      <div className="nav-actions" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <input 
             type="text" 
             placeholder="Шукати книгу..." 
             value={searchQuery} 
             onChange={(e) => setSearchQuery(e.target.value)} 
             style={{
               background: 'rgba(255,255,255,0.04)',
               border: '1px solid var(--glass-border)',
               borderRadius: '99px',
               padding: '0.45rem 1rem 0.45rem 2.2rem',
               color: 'white',
               fontSize: '0.85rem',
               width: '160px',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               outline: 'none'
             }}
             onFocus={(e) => {
               e.target.style.width = '220px';
               e.target.style.borderColor = 'var(--accent)';
               e.target.style.background = 'rgba(255,255,255,0.07)';
             }}
             onBlur={(e) => {
               e.target.style.width = '160px';
               e.target.style.borderColor = 'var(--glass-border)';
               e.target.style.background = 'rgba(255,255,255,0.04)';
             }}
          />
          <Search style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} size={15} />
        </form>
        
        {user ? (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {user.is_admin === 1 && (
              <Link to="/admin" className="nav-link" style={{ fontSize: '0.85rem' }}>Адмін</Link>
            )}
            <Link to="/profile" style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.username}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Профіль</span>
              </div>
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid var(--glass-border)', transition: 'transform 0.3s' }} 
                className="nav-avatar"
              />
            </Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>Вийти</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Увійти <LogIn size={18} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
