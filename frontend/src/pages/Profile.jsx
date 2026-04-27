import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUser({ username, bio, avatar_url: avatarUrl });
    if (success) {
      setMessage('Профіль успішно оновлено!');
      setIsError(false);
    } else {
      setMessage('Помилка при оновленні профілю.');
      setIsError(true);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) return <div className="content-section">Будь ласка, увійдіть, щоб переглянути профіль.</div>;

  return (
    <div className="content-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass" style={{ padding: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Мій Профіль</h2>
        
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '3rem' }}>
          <div className="book-cover-container" style={{ width: '150px', height: '150px', borderRadius: '50%', margin: 0 }}>
            <img src={avatarUrl} alt="Avatar" className="book-cover" />
          </div>
          <div>
            <h3>{user.username}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            {user.is_admin === 1 && (
              <span style={{ 
                background: 'var(--accent)', 
                color: 'var(--bg-dark)', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '6px', 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                marginTop: '0.5rem',
                display: 'inline-block'
              }}>
                Адміністратор
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ім'я користувача</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="glass"
              style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Про мене (Bio)</label>
            <textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              className="glass"
              placeholder="Розкажіть трохи про свої літературні вподобання..."
              style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>URL аватара</label>
            <input 
              type="text" 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="glass"
              style={{ width: '100%', padding: '0.8rem', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Ми використовуємо <a href="https://www.dicebear.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>DiceBear</a> для генерації за замовчуванням.
            </p>
          </div>

          <button type="submit" className="btn-primary" style={{ width: 'fit-content', marginTop: '1rem' }}>
            Зберегти зміни
          </button>

          {message && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              borderRadius: '10px', 
              background: isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              border: `1px solid ${isError ? '#ef4444' : '#22c55e'}`,
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
