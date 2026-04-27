import React, { useState, useEffect } from 'react';
import { Users, Search, ArrowRight, Library } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyClubs = () => {
  const [clubs, setClubs] = useState([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8000/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setClubs(data.clubs || []));
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

              <Link to={`/clubs/${club.id}`} className="btn-primary" style={{ justifyContent: 'center' }}>
                Відкрити клуб <ArrowRight size={20} />
              </Link>
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
    </div>
  );
};

export default MyClubs;
