import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Trophy, Calendar, FileText, User as UserIcon, ArrowLeft } from 'lucide-react';
import * as Lucide from 'lucide-react';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile | achievements

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}/profile`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        } else {
          const err = await res.json();
          setError(err.detail || 'Користувача не знайдено');
        }
      } catch (err) {
        setError('Помилка завантаження даних');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading) return <div className="content-section" style={{ textAlign: 'center', padding: '5rem' }}>Завантаження профілю...</div>;
  if (error) return (
    <div className="content-section" style={{ textAlign: 'center', padding: '5rem' }}>
      <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Ой! {error}</h2>
      <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={18} /> На головну
      </Link>
    </div>
  );

  const { user, stats, achievements, challenge, diary } = profileData;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Progress stats
  const completedBooks = diary.filter(b => b.status === 'completed').length;
  const readingBooks = diary.filter(b => b.status === 'reading').length;
  
  // Calculate annual challenge progress
  const progressPercent = challenge 
    ? Math.min((completedBooks / challenge.target_books) * 100, 100)
    : 0;

  return (
    <div className="content-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Navigation & Title */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: activeTab === 'profile' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}
        >
          <UserIcon size={18} /> Профіль {user.username}
        </button>
        <button 
          onClick={() => setActiveTab('achievements')}
          style={{ background: 'none', border: 'none', color: activeTab === 'achievements' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: activeTab === 'achievements' ? '2px solid var(--accent)' : 'none', paddingBottom: '0.5rem' }}
        >
          <Trophy size={18} /> Досягнення ({unlockedCount})
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Main Info */}
          <div>
            <div className="glass" style={{ padding: '2.5rem', marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="Avatar" 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} 
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ margin: 0 }}>{user.username}</h2>
                  {user.is_admin === 1 && (
                    <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      Адмін
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {user.bio || 'Цей читач поки що не розповів про себе.'}
                </p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.pages_read}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Стор. прочитано</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>{completedBooks}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Книг завершено</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diary (Book List) Section */}
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen className="accent" size={22} /> Дневник Читання ({diary.length})
            </h3>
            
            {diary.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>У щоденнику ще немає книг.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {diary.map(item => (
                  <div key={item.book_id} className="glass" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to={`/books/${item.book_id}`} style={{ flexShrink: 0 }}>
                      <img 
                        src={item.cover_url} 
                        alt={item.title} 
                        style={{ width: '60px', height: '90px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} 
                      />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0' }}>
                        <Link to={`/books/${item.book_id}`} style={{ textDecoration: 'none', color: 'white' }}>{item.title}</Link>
                      </h4>
                      <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.author}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                        <span style={{ 
                          background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: item.status === 'completed' ? '#10b981' : '#818cf8',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.75rem'
                        }}>
                          {item.status === 'completed' ? 'Прочитано' : item.status === 'reading' ? 'Читає' : 'У планах'}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '200px' }}>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', flex: 1, overflow: 'hidden' }}>
                            <div style={{ 
                              height: '100%', 
                              width: `${item.status === 'completed' ? 100 : (item.current_page / (item.total_pages || 1)) * 100}%`,
                              background: 'var(--accent)' 
                            }}></div>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {item.status === 'completed' ? item.total_pages : item.current_page}/{item.total_pages} ст.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Annual Challenge & Quick stats */}
          <div>
            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                <Calendar className="accent" size={20} /> Ціль читання {new Date().getFullYear()}
              </h3>
              {challenge ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{completedBooks} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {challenge.target_books}</span></div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold' }}>{Math.round(progressPercent)}%</div>
                  </div>
                  
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '5px' }}></div>
                  </div>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', textAlign: 'center' }}>
                    {completedBooks >= challenge.target_books 
                      ? `🎉 Користувач виконав свою річну ціль у ${challenge.target_books} книг!` 
                      : `Прочитано ${completedBooks} книг із запланованих ${challenge.target_books}.`}
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', fontStyle: 'italic' }}>Річну ціль ще не встановлено.</p>
              )}
            </div>

            <div className="glass" style={{ padding: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                <Trophy className="accent" size={20} /> Останні трофеї
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {achievements.filter(a => a.unlocked).slice(0, 6).map(ach => {
                  const Icon = Lucide[ach.icon_name] || Lucide.Trophy;
                  return (
                    <div key={ach.id} title={ach.title} style={{ 
                      width: '45px', height: '45px', borderRadius: '50%', 
                      background: 'var(--gradient-primary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                      <Icon size={20} />
                    </div>
                  );
                })}
                {unlockedCount === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Ще немає розблокованих досягнень.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        
        /* Tab: All Achievements grid */
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Досягнення читача</h2>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
              Отримано: <strong style={{ color: 'var(--accent)' }}>{unlockedCount}</strong> з <strong>{achievements.length}</strong>
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {achievements.map(ach => (
              <div 
                key={ach.id} 
                className="glass" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  opacity: ach.unlocked ? 1 : 0.5,
                  background: ach.unlocked ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(255,255,255,0.02) 100%)' : 'rgba(255,255,255,0.01)',
                  border: ach.unlocked ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--glass-border)'
                }}
              >
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '50%', 
                  background: ach.unlocked ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'white', marginBottom: '1.25rem', 
                  boxShadow: ach.unlocked ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none'
                }}>
                  {(() => {
                    const IconComponent = Lucide[ach.icon_name] || Lucide.Trophy;
                    return <IconComponent size={28} />;
                  })()}
                </div>
                
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{ach.title}</h4>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>{ach.description}</p>
                
                <div style={{ width: '100%', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: ach.unlocked ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>{ach.unlocked ? 'Розблоковано' : 'В процесі'}</span>
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
      
    </div>
  );
};

export default UserProfile;
