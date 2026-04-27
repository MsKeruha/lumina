import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
    setLoading(false);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/admin/books', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, author, category, description, cover_url: coverUrl }),
    });

    if (res.ok) {
      setMessage('Книгу успішно додано!');
      setTitle(''); setAuthor(''); setCategory(''); setDescription(''); setCoverUrl('');
      fetchStats();
    } else {
      setMessage('Помилка при додаванні книги.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (user?.is_admin !== 1) return (
    <div className="content-section" style={{ textAlign: 'center' }}>
      <h2>Доступ заборонено</h2>
      <p>Ця сторінка доступна тільки для адміністраторів.</p>
    </div>
  );

  return (
    <div className="content-section">
      <h1 style={{ marginBottom: '3rem' }}>Панель Адміністратора</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Stats Section */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Статистика Платформи</h2>
          {loading ? <p>Завантаження...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats?.users_count}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Користувачів</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats?.books_count}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Книг</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats?.clubs_count}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Клубів</div>
              </div>
            </div>
          )}
        </div>

        {/* Add Book Section */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Додати Нову Книгу</h2>
          <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" placeholder="Назва книги" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="glass" style={{ padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
            <input 
              type="text" placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} required
              className="glass" style={{ padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
            <input 
              type="text" placeholder="Категорія" value={category} onChange={(e) => setCategory(e.target.value)}
              className="glass" style={{ padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
            <input 
              type="text" placeholder="URL обкладинки" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
              className="glass" style={{ padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
            <textarea 
              placeholder="Опис книги" value={description} onChange={(e) => setDescription(e.target.value)}
              className="glass" style={{ padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', minHeight: '80px' }}
            />
            <button type="submit" className="btn-primary">Додати Книгу</button>
            {message && <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--accent)' }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
