import React, { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Library, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import Toast from '../components/Toast';


const MyClubs = () => {
  const [clubs, setClubs] = useState([]);
  const { user, loading } = useAuth();
  
  const [clubToLeave, setClubToLeave] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleConfirmLeave = async () => {
    if (!clubToLeave) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/${clubToLeave.id}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setClubs(clubs.filter(c => c.id !== clubToLeave.id));
        setToast({ message: `Ви вийшли з клубу "${clubToLeave.name}"`, type: 'success' });
      } else {
        setToast({ message: 'Помилка при спробі вийти з клубу', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    } finally {
      setClubToLeave(null);
    }
  };


  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('/api/users/me/clubs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setClubs(data || []));

    }
  }, [user]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Завантаження...</div>;

  if (!user) {
    return (
      <div className="content-section" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div className="glass" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <Library size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
          <h2>Увійдіть, щоб переглянути свої клуби</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ви ще не авторизовані. Тільки зареєстровані користувачі можуть брати участь у клубах.</p>
          <Link to="/login" className="btn-primary" style={{ justifyContent: 'center' }}>Увійти до акаунта</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Мої Клуби</h1>
          <p style={{ color: 'var(--text-muted)' }}>Клуби, у яких ви берете активну участь.</p>
        </div>
        <Link to="/clubs" className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
          <Search size={20} /> Знайти нові клуби
        </Link>
      </div>

      {clubs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {clubs.map((club, index) => (
            <motion.div 
              key={club.id}
              className="glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--primary-gradient)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Users size={24} color="white" />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{club.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', height: '4.8rem', overflow: 'hidden' }}>
                  {club.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                <Link to={`/clubs/${club.id}`} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Відкрити клуб <ArrowRight size={20} />
                </Link>
                <button 
                  onClick={() => setClubToLeave(club)}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    color: '#f87171',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Покинути клуб"
                >
                  <LogOut size={20} />
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem' }}>
          <Library size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Ви ще не приєдналися до жодного клубу</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Досліджуйте спільноту та знайдіть щось цікаве для себе!</p>
          <Link to="/clubs" className="btn-primary" style={{ display: 'inline-flex' }}>Дослідити клуби</Link>
        </div>
      )}
      {/* Modal for Confirmation */}
      <Modal
        isOpen={!!clubToLeave}
        onClose={() => setClubToLeave(null)}
        title="Покинути клуб"
        footer={
          <>
            <button 
              onClick={() => setClubToLeave(null)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Скасувати
            </button>
            <button 
              onClick={handleConfirmLeave}
              style={{ background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Підтвердити вихід
            </button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          Ви дійсно бажаєте вийти з читацького клубу <strong>"{clubToLeave?.name}"</strong>? 
          Ваш прогрес обговорень у цьому клубі буде збережено, але ви більше не зможете писати коментарі, поки не приєднаєтесь знову.
        </p>
      </Modal>

      {/* Toast Notification */}
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

export default MyClubs;
