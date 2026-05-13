import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Book, Star, BookOpen, Medal, Trophy, Award, Edit3, Target, Check, ChevronRight } from 'lucide-react';
import * as Lucide from 'lucide-react';
import '../App.css';
import Modal from '../components/Modal';
import Toast from '../components/Toast';



const Profile = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  
  const [toast, setToast] = useState({ message: '', type: 'success' });
  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'achievements'

  const [diary, setDiary] = useState([]);
  const [loadingDiary, setLoadingDiary] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // store item to edit pages
  const [tempPage, setTempPage] = useState(0);

  const [challenge, setChallenge] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newTarget, setNewTarget] = useState(12);

  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDiary();
      fetchChallenge();
      fetchAchievements();
    }
  }, [user]);

  const fetchDiary = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/users/me/diary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDiary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiary(false);
    }
  };

  const fetchChallenge = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/users/me/challenge', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        if (data) setNewTarget(data.target_books);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAchievements = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/users/me/achievements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/users/me/diary/${editingItem.id}/progress`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ current_page: parseInt(tempPage) })
      });
      if (res.ok) {
        setToast({ message: 'Прогрес оновлено!', type: 'success' });
        setEditingItem(null);
        fetchDiary();
        fetchAchievements(); // In case they unlocked bookworm
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetChallenge = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/users/me/challenge', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ year: new Date().getFullYear(), target_books: parseInt(newTarget) })
      });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        setShowChallengeModal(false);
        setToast({ message: 'Ціль на рік встановлено!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleRemoveFromDiary = async (bookId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/users/me/diary/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDiary(diary.filter(item => item.book_id !== bookId));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUser({ username, bio, avatar_url: avatarUrl });
    if (success) {
      setToast({ message: 'Профіль успішно оновлено!', type: 'success' });
    } else {
      setToast({ message: 'Помилка при оновленні профілю.', type: 'error' });
    }
  };

  if (!user) return <div className="content-section">Будь ласка, увійдіть, щоб переглянути профіль.</div>;

  return (
    <div className="content-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header with Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: activeTab === 'profile' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}
        >
          <BookOpen size={18} /> Мій Кабінет
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          style={{ background: 'none', border: 'none', color: activeTab === 'achievements' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: activeTab === 'achievements' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}
        >
          <Trophy size={18} /> Досягнення ({achievements.filter(a => a.unlocked).length})
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Left Column: Main Profile & Diary */}
          <div>
            {/* Basic Profile Glass Card */}
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="book-cover-container" style={{ width: '100px', height: '100px', borderRadius: '50%', margin: 0 }}>
                  <img src={avatarUrl} alt="Avatar" className="book-cover" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{user.username}</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
                  {user.is_admin === 1 && (
                    <span style={{ background: 'var(--accent)', color: 'var(--bg-dark)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'inline-block' }}>
                      Адміністратор
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="glass" placeholder="Ім'я" style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }} />
                </div>
                <div className="form-group">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="glass" placeholder="Розкажіть про свої літературні вподобання..." style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', minHeight: '60px', resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="glass" placeholder="Аватар URL" style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Оновити профіль</button>
              </form>
            </div>

            {/* Literary Diary Grid */}
            <div className="glass" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen className="accent" size={22} /> Мій Щоденник
              </h3>
              {loadingDiary ? (
                <p>Завантаження...</p>
              ) : diary.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
                  {diary.map((item) => {
                    const getConf = (s) => {
                      if (s === 'reading') return { text: 'Читаю', clr: '#6366f1' };
                      if (s === 'completed') return { text: 'Прочитано', clr: '#10b981' };
                      return { text: 'Планую', clr: '#f59e0b' };
                    };
                    const conf = getConf(item.status);
                    const progressPct = Math.round((item.current_page / item.total_pages) * 100) || 0;

                    return (
                      <div key={item.id} className="glass" style={{ padding: '0.8rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
                        <img src={item.book.cover_url || 'https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=200'} alt="Cover" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.book.title}</h4>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: conf.clr, border: `1px solid ${conf.clr}`, padding: '0.1rem 0.4rem', borderRadius: '8px' }}>{conf.text}</span>
                          </div>

                          {/* Progress Bar for currently reading */}
                          {item.status === 'reading' && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                <span>{item.current_page} ст.</span>
                                <span style={{ color: 'var(--text-muted)' }}>{progressPct}%</span>
                              </div>
                              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary)' }}></div>
                              </div>
                              <button 
                                onClick={() => { setEditingItem(item); setTempPage(item.current_page); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                              >
                                <Edit3 size={12} /> Встановити сторінку
                              </button>
                            </div>
                          )}
                        </div>

                        <button onClick={() => handleRemoveFromDiary(item.book_id)} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'rgba(239, 68, 68, 0.8)', border: 'none', padding: '0.4rem', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex' }} title="Видалити">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Щоденник порожній.</p>
              )}
            </div>
          </div>

          {/* Right Column: Gamification (Annual Challenge) */}
          <div>
            <div className="glass" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Target className="accent" size={20} /> Книжковий Виклик {new Date().getFullYear()}
              </h3>
              
              {challenge ? (
                <div>
                  {(() => {
                    const completedThisYear = diary.filter(d => d.status === 'completed').length;
                    const pct = Math.min(Math.round((completedThisYear / challenge.target_books) * 100), 100);
                    return (
                      <>
                        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{completedThisYear} / {challenge.target_books}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>книг прочитано</div>
                        </div>
                        
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--accent)' }}>{pct}% виконано</div>

                        <button 
                          onClick={() => setShowChallengeModal(true)} 
                          style={{ width: '100%', marginTop: '1.5rem', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Змінити ціль
                        </button>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Встановіть особисту мету по кількості прочитаних книг на цей рік!</p>
                  <button onClick={() => setShowChallengeModal(true)} className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    Прийняти виклик
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Achievements Tab Layout */
        <div className="glass" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy className="accent" size={28} /> Мої Літературні Досягнення
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Ви розблокували {achievements.filter(a => a.unlocked).length} з {achievements.length} бейджів</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className="glass" 
                style={{ 
                  padding: '2rem 1.5rem', 
                  borderRadius: '20px', 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  opacity: ach.unlocked ? 1 : 0.4,
                  background: ach.unlocked ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(255,255,255,0.02) 100%)' : 'rgba(255,255,255,0.01)',
                  border: ach.unlocked ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--glass-border)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', 
                  background: ach.unlocked ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'white', marginBottom: '1.25rem', 
                  boxShadow: ach.unlocked ? '0 10px 25px -5px rgba(99, 102, 241, 0.4)' : 'none'
                }}>
                  {(() => {
                    const IconComponent = Lucide[ach.icon_name] || Lucide.Trophy;
                    return <IconComponent size={32} />;
                  })()}
                </div>
                
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{ach.title}</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>{ach.description}</p>
                
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: ach.unlocked ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>{ach.unlocked ? 'Розблоковано' : 'У процесі'}</span>
                    <span>{Math.round(ach.progress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${ach.progress}%`, height: '100%', background: ach.unlocked ? 'var(--accent)' : 'rgba(255,255,255,0.2)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals and Overlay items */}

      {/* 1. Annual Challenge Setter Modal */}
      <Modal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        title="Ціль на рік"
        footer={
          <>
            <button onClick={() => setShowChallengeModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
            <button onClick={handleSetChallenge} className="btn-primary">Встановити ціль</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Вкажіть кількість книг, яку ви плануєте прочитати протягом {new Date().getFullYear()} року.</p>
          <input 
            type="number" 
            value={newTarget} 
            onChange={(e) => setNewTarget(e.target.value)} 
            min="1"
            className="glass" 
            style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '1.2rem' }} 
          />
        </div>
      </Modal>

      {/* 2. Page Progress Editor Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Оновити прогрес читання"
        footer={
          <>
            <button onClick={() => setEditingItem(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
            <button onClick={handleUpdateProgress} className="btn-primary">Зберегти</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Вкажіть поточну прочитану сторінку для книги <strong>"{editingItem?.book.title}"</strong>.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="number" 
              value={tempPage} 
              onChange={(e) => setTempPage(e.target.value)} 
              max={editingItem?.total_pages}
              min="0"
              className="glass" 
              style={{ flex: 1, padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '1.2rem' }} 
            />
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>з {editingItem?.total_pages} ст.</span>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      )}

    </div>

  );
};

export default Profile;
