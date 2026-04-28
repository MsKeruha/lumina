import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowRight, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClubData, setNewClubData] = useState({ name: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/clubs')
      .then(res => res.json())
      .then(data => setClubs(data));
  }, []);

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoin = async (clubId) => {
    if (!user) return alert('Будь ласка, увійдіть, щоб приєднатися до клубу');
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clubs/${clubId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert('Ви успішно приєдналися до клубу!');
      window.location.reload();
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!user) return alert('Увійдіть, щоб створити клуб');
    
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clubs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newClubData)
    });

    if (res.ok) {
      setShowCreateForm(false);
      setNewClubData({ name: '', description: '' });
      // Refresh clubs
      const clubsRes = await fetch('/api/clubs');
      const clubsData = await clubsRes.json();
      setClubs(clubsData);
    }
  };

  return (
    <div className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Книжкові Клуби</h1>
          <p style={{ color: 'var(--text-muted)' }}>Приєднуйтесь до спільнот, що обговорюють ваші улюблені жанри.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Пошук клубів..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.6rem 1rem 0.6rem 2.5rem', color: 'white', outline: 'none' }}
            />
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            {showCreateForm ? 'Скасувати' : <><Plus size={20} /> Створити Клуб</>}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass" 
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Створити новий клуб</h3>
          <form onSubmit={handleCreateClub} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Назва клубу</label>
              <input 
                type="text"
                value={newClubData.name}
                onChange={(e) => setNewClubData({...newClubData, name: e.target.value})}
                placeholder="Наприклад: 'Клуб фанатів фентезі'"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white' }}
                required
              />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Опис</label>
              <textarea 
                value={newClubData.description}
                onChange={(e) => setNewClubData({...newClubData, description: e.target.value})}
                placeholder="Розкажіть, про що ваш клуб..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white', minHeight: '100px' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Створити</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {filteredClubs.map((club, index) => (
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
              <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                {club.members?.length || 0} учасників
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{club.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', height: '4.8rem', overflow: 'hidden' }}>
                {club.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button 
                onClick={() => handleJoin(club.id)}
                className="btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={user && club.members?.some(m => m.id === user.id)}
              >
                {user && club.members?.some(m => m.id === user.id) ? 'Ви учасник' : 'Приєднатися'}
              </button>
              <Link to={`/clubs/${club.id}`} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem' }}>
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClubList;
