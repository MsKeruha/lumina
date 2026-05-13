import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Book, Users, Trophy, ArrowLeft, ArrowRight, Plus, Sparkles, ShieldAlert } from 'lucide-react';
import * as Lucide from 'lucide-react';
import '../App.css';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import CustomSelect from '../components/CustomSelect';

const POPULAR_ICONS = [
  'Trophy', 'Award', 'Medal', 'Star', 'Flame', 
  'Book', 'BookOpen', 'Bookmark', 'Library', 'PenTool',
  'Compass', 'Map', 'Heart', 'Target', 'Crown',
  'Sparkles', 'Users', 'MessageSquare', 'Coffee', 'Lightbulb'
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'clubs', 'achievements'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // ------------------ TAB: BOOKS ------------------
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 10;

  // Add Book form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // ------------------ TAB: CLUBS ------------------
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [clubToDelete, setClubToDelete] = useState(null);

  // ------------------ TAB: ACHIEVEMENTS ------------------
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [achToDelete, setAchToDelete] = useState(null);

  // Add Achievement form state
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achCriterion, setAchCriterion] = useState('books_read');
  const [achTarget, setAchTarget] = useState(1);
  const [achIcon, setAchIcon] = useState('Trophy');
  const [isCustomCriterion, setIsCustomCriterion] = useState(false);
  const [customFormula, setCustomFormula] = useState('');

  // --- Side Effects & Fetching ---
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'clubs') {
      fetchClubs();
    } else if (activeTab === 'achievements') {
      fetchAchievements();
    }
  }, [activeTab, page]);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBooks = async () => {
    setLoadingBooks(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/books?skip=${page * limit}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error("Error books:", err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchClubs = async () => {
    setLoadingClubs(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/clubs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClubs(data);
      }
    } catch (err) {
      console.error("Error clubs:", err);
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchAchievements = async () => {
    setLoadingAchievements(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/achievements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error("Error achievements:", err);
    } finally {
      setLoadingAchievements(false);
    }
  };

  // --- ACTIONS: BOOKS ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, author, category, description, cover_url: coverUrl }),
      });

      if (res.ok) {
        setToast({ message: 'Книгу успішно додано!', type: 'success' });
        setTitle(''); setAuthor(''); setCategory(''); setDescription(''); setCoverUrl('');
        fetchStats();
        fetchBooks();
      } else {
        setToast({ message: 'Помилка при додаванні книги.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Мережева помилка.', type: 'error' });
    }
  };

  const handleConfirmDeleteBook = async () => {
    if (!bookToDelete) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/books/${bookToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBooks();
        fetchStats();
        setToast({ message: 'Книгу видалено з каталогу', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Помилка видалення', type: 'error' });
    } finally {
      setBookToDelete(null);
    }
  };

  // --- ACTIONS: CLUBS ---
  const handleConfirmDeleteClub = async () => {
    if (!clubToDelete) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/clubs/${clubToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchClubs();
        fetchStats();
        setToast({ message: 'Клуб успішно модеровано (видалено)!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Помилка видалення клубу', type: 'error' });
    } finally {
      setClubToDelete(null);
    }
  };

  // --- ACTIONS: ACHIEVEMENTS ---
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: achTitle,
          description: achDesc,
          icon_name: achIcon,
          criterion_type: isCustomCriterion ? customFormula : achCriterion,
          target_value: parseInt(achTarget)
        })
      });
      if (res.ok) {
        setToast({ message: 'Досягнення успішно створено!', type: 'success' });
        setAchTitle(''); setAchDesc(''); setAchTarget(1); setAchIcon('Trophy');
        setIsCustomCriterion(false); setCustomFormula('');
        fetchAchievements();
      } else {
        const errData = await res.json();
        setToast({ message: errData.detail || 'Помилка створення досягнення', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Помилка з\'єднання', type: 'error' });
    }
  };

  const handleConfirmDeleteAchievement = async () => {
    if (!achToDelete) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/achievements/${achToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAchievements();
        setToast({ message: 'Досягнення остаточно видалено.', type: 'success' });
      }
    } catch (e) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    } finally {
      setAchToDelete(null);
    }
  };

  // --- Render Helper for Lucide Icons ---
  const renderLucideIcon = (iconName, size = 20, color = 'currentColor') => {
    const Comp = Lucide[iconName] || Lucide.Trophy;
    return <Comp size={size} color={color} />;
  };

  if (user?.is_admin !== 1) {
    return (
      <div className="content-section" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <ShieldAlert size={64} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
        <h2>Доступ обмежено</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ця зона доступна виключно для користувачів з правами адміністратора.</p>
      </div>
    );
  }

  // Calculations for pagination
  const totalBooks = stats?.books_count || 0;
  const totalPages = Math.ceil(totalBooks / limit);

  const tabButtonStyle = (tabName) => ({
    flex: 1,
    padding: '1rem',
    background: activeTab === tabName ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.03)',
    border: '1px solid',
    borderColor: activeTab === tabName ? 'transparent' : 'var(--glass-border)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    boxShadow: activeTab === tabName ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
  });

  return (
    <div className="content-section">
      <h1 style={{ marginBottom: '3rem', textAlign: 'left', fontSize: '2.5rem' }}>Панель Модератора</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '3rem' }}>
        <button onClick={() => { setActiveTab('books'); setPage(0); }} style={tabButtonStyle('books')}>
          <Book size={20} /> Каталог Книг
        </button>
        <button onClick={() => { setActiveTab('clubs'); setPage(0); }} style={tabButtonStyle('clubs')}>
          <Users size={20} /> Управління Клубами
        </button>
        <button onClick={() => { setActiveTab('achievements'); setPage(0); }} style={tabButtonStyle('achievements')}>
          <Trophy size={20} /> Конструктор Досягнень
        </button>
      </div>

      {/* Global stats summary row */}
      {!loadingStats && stats && (
        <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.users_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Користувачів</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.books_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Книг</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.clubs_count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Діючих Клубів</div>
          </div>
        </div>
      )}

      {/* TAB CONTENTS: BOOKS */}
      {activeTab === 'books' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Add New Book */}
          <div className="glass" style={{ padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus className="primary" size={24} /> Додати Нове Видання
            </h2>
            <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <input 
                type="text" placeholder="Назва книги" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="glass" style={{ padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '0.95rem' }}
              />
              <input 
                type="text" placeholder="Автор" value={author} onChange={(e) => setAuthor(e.target.value)} required
                className="glass" style={{ padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '0.95rem' }}
              />
              <input 
                type="text" placeholder="Категорія (напр. Фентезі)" value={category} onChange={(e) => setCategory(e.target.value)}
                className="glass" style={{ padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '0.95rem' }}
              />
              <input 
                type="text" placeholder="URL обкладинки (Image URL)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                className="glass" style={{ padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '0.95rem' }}
              />
              <textarea 
                placeholder="Анотація / Опис книги..." value={description} onChange={(e) => setDescription(e.target.value)}
                className="glass" style={{ gridColumn: 'span 2', padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', minHeight: '100px', resize: 'vertical', fontSize: '0.95rem' }}
              />
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2.5rem' }}>Зберегти в каталог</button>
              </div>
            </form>
          </div>

          {/* Books Table with Pagination */}
          <div className="glass" style={{ padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>Список Книг (Каталог)</h2>
            {loadingBooks ? (
              <p style={{ color: 'var(--text-muted)' }}>Оновлення списку...</p>
            ) : books.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '1rem' }}>ID</th>
                        <th style={{ padding: '1rem' }}>Обкладинка</th>
                        <th style={{ padding: '1rem' }}>Назва</th>
                        <th style={{ padding: '1rem' }}>Автор</th>
                        <th style={{ padding: '1rem' }}>Категорія</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{b.id}</td>
                          <td style={{ padding: '1rem' }}>
                            <img 
                              src={b.cover_url || 'https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=200'} 
                              alt="Cover" 
                              style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '600' }}>{b.title}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{b.author}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--glass-border)' }}>
                              {b.category || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => setBookToDelete(b)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.5rem', color: '#f87171', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
                    <button 
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className="glass"
                      style={{ padding: '0.5rem 1rem', color: 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <ArrowLeft size={16} /> Попередня
                    </button>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Сторінка <strong style={{ color: 'white' }}>{page + 1}</strong> з {totalPages}
                    </span>
                    <button 
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                      className="glass"
                      style={{ padding: '0.5rem 1rem', color: 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      Наступна <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Книг на даній сторінці немає.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENTS: CLUBS */}
      {activeTab === 'clubs' && (
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Модерація Книжкових Клубів</h2>
          {loadingClubs ? (
            <p style={{ color: 'var(--text-muted)' }}>Завантаження клубів...</p>
          ) : clubs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Назва клубу</th>
                    <th style={{ padding: '1rem' }}>Куратор (ID)</th>
                    <th style={{ padding: '1rem' }}>Учасників</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Модерація</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{c.id}</td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{c.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID {c.creator_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge-info" style={{ padding: '0.25rem 0.6rem', background: 'rgba(99,102,241,0.15)', borderRadius: '10px', fontSize: '0.8rem' }}>
                          {c.members?.length || 0} читачів
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => setClubToDelete(c)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.5rem 0.8rem', color: '#f87171', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        >
                          <Trash2 size={14} /> Видалити клуб
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Клубів ще не створено.</p>
          )}
        </div>
      )}

      {/* TAB CONTENTS: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          {/* Column Left: Creator Form */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles className="accent" size={24} /> Нове Досягнення
            </h2>
            <form onSubmit={handleAddAchievement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Назва бейджа</label>
                <input 
                  type="text" placeholder="Наприклад: Гуру Обговорень" value={achTitle} onChange={(e) => setAchTitle(e.target.value)} required
                  className="glass" style={{ width: '100%', padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Опис завдання</label>
                <input 
                  type="text" placeholder="Наприклад: Написати 50 коментарів" value={achDesc} onChange={(e) => setAchDesc(e.target.value)} required
                  className="glass" style={{ width: '100%', padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Критерій прогресу</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <CustomSelect 
                      value={isCustomCriterion ? 'custom' : achCriterion}
                      onChange={(val) => {
                        if (val === 'custom') {
                          setIsCustomCriterion(true);
                        } else {
                          setIsCustomCriterion(false);
                          setAchCriterion(val);
                        }
                      }}
                      options={[
                        { value: 'books_read', label: '📚 Прочитано книг (Completed)' },
                        { value: 'comments_posted', label: '💬 Залишено коментарів' },
                        { value: 'clubs_created', label: '🏛️ Створено клубів' },
                        { value: 'diary_added', label: '📖 Книг додано в щоденник' },
                        { value: 'pages_read', label: '📄 Кількість прочитаних сторінок' },
                        { value: 'polls_voted', label: '🗳️ Голосувань в опитуваннях' },
                        { value: 'custom', label: '⚙️ [Власна код-формула...]' }
                      ]}
                    />
                    
                    {isCustomCriterion && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <input 
                          type="text" 
                          placeholder="Напр: books_read * 10 + pages_read" 
                          value={customFormula} 
                          onChange={(e) => setCustomFormula(e.target.value)} 
                          required
                          className="glass" 
                          style={{ width: '100%', padding: '0.7rem', color: '#818cf8', border: '1px dashed #818cf8', outline: 'none', fontFamily: 'monospace' }}
                        />
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                          <strong>Змінні:</strong> <code>books_read</code>, <code>comments_posted</code>, <code>clubs_created</code>, <code>diary_added</code>, <code>pages_read</code>, <code>polls_voted</code>.<br/>
                          💡 Можна будувати логічні вирази: <code>and</code>, <code>or</code>, <code>&gt;</code>, <code>&lt;</code>, <code>==</code>. Наприклад: <code>books_read &gt; 5 and pages_read &gt; 300</code> (у цьому випадку встановіть ціль = 1).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ціль (Число)</label>
                  <input 
                    type="number" min="1" value={achTarget} onChange={(e) => setAchTarget(e.target.value)} required
                    className="glass" style={{ width: '100%', padding: '0.85rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Visual Icon Selector Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Виберіть іконку: <strong style={{ color: 'white' }}>{achIcon}</strong>
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '0.5rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)' 
                }}>
                  {POPULAR_ICONS.map((iconName) => (
                    <div 
                      key={iconName}
                      onClick={() => setAchIcon(iconName)}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: achIcon === iconName ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: achIcon === iconName ? 'transparent' : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { if (achIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                      onMouseOut={(e) => { if (achIcon !== iconName) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      {renderLucideIcon(iconName, 22)}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>Створити бейдж</button>
            </form>
          </div>

          {/* Column Right: Achievements Table */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Існуючі Досягнення</h2>
            {loadingAchievements ? (
              <p style={{ color: 'var(--text-muted)' }}>Завантаження...</p>
            ) : achievements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className="glass" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      padding: '1rem', 
                      borderRadius: '16px', 
                      background: 'rgba(255,255,255,0.02)' 
                    }}
                  >
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {renderLucideIcon(ach.icon_name, 24)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{ach.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ach.description}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', color: 'var(--accent)' }}>
                          {ach.criterion_type} &ge; {ach.target_value}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAchToDelete(ach)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.5rem', color: '#f87171', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>У базі немає створених досягнень.</p>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}

      {/* 1. Delete Book Modal */}
      <Modal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        title="Видалити книгу?"
        footer={
          <>
            <button onClick={() => setBookToDelete(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
            <button onClick={handleConfirmDeleteBook} style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Видалити назавжди</button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Дійсно видалити книгу <strong>"{bookToDelete?.title}"</strong>? Це спричинить її зникнення з усіх щоденників читачів.
        </p>
      </Modal>

      {/* 2. Delete Club Modal */}
      <Modal
        isOpen={!!clubToDelete}
        onClose={() => setClubToDelete(null)}
        title="Видалити книжковий клуб?"
        footer={
          <>
            <button onClick={() => setClubToDelete(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
            <button onClick={handleConfirmDeleteClub} style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Застосувати модерацію</button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Ви збираєтесь видалити книжковий клуб <strong>"{clubToDelete?.name}"</strong>. Усі чати, обговорення та голосування клубу будуть анульовані назавжди.
        </p>
      </Modal>

      {/* 3. Delete Achievement Modal */}
      <Modal
        isOpen={!!achToDelete}
        onClose={() => setAchToDelete(null)}
        title="Видалити досягнення?"
        footer={
          <>
            <button onClick={() => setAchToDelete(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
            <button onClick={handleConfirmDeleteAchievement} style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Видалити</button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Ви збираєтесь видалити бейдж <strong>"{achToDelete?.title}"</strong>. Це забере дане досягнення у всіх користувачів, які його раніше розблокували.
        </p>
      </Modal>

      {/* Toast Alerts */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, message: '' })} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
