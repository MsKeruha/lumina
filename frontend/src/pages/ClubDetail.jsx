import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Calendar, User, Send, Book } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ClubDetail = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [books, setBooks] = useState([]);
  const [newDiscData, setNewDiscData] = useState({ topic: '', book_id: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetch(`http://localhost:8000/clubs/${clubId}`)
      .then(res => res.json())
      .then(data => setClub(data));

    fetch(`http://localhost:8000/clubs/${clubId}/discussions`)
      .then(res => res.json())
      .then(data => setDiscussions(data));

    fetch('http://localhost:8000/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, [clubId]);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!user) return alert('Увійдіть, щоб створити обговорення');
    
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/clubs/${clubId}/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        topic: newDiscData.topic,
        book_id: newDiscData.book_id,
        scheduled_at: new Date().toISOString(),
        club_id: clubId
      })
    });

    if (res.ok) {
      setShowCreateForm(false);
      setNewDiscData({ topic: '', book_id: '' });
      // Refresh discussions
      const discRes = await fetch(`http://localhost:8000/clubs/${clubId}/discussions`);
      const discData = await discRes.json();
      setDiscussions(discData);
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!user) return alert('Увійдіть, щоб коментувати');
    const content = newComment[discussionId];
    if (!content) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ content })
    });

    if (res.ok) {
      setNewComment({ ...newComment, [discussionId]: '' });
      // Refresh discussions to show new comment
      const discRes = await fetch(`http://localhost:8000/clubs/${clubId}/discussions`);
      const discData = await discRes.json();
      setDiscussions(discData);
    }
  };

  if (!club) return <div style={{ padding: '4rem', textAlign: 'center' }}>Завантаження...</div>;

  return (
    <div className="content-section">
      <div className="glass" style={{ padding: '3rem', marginBottom: '3rem', borderRadius: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{club.name}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px' }}>{club.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Створено користувачем</div>
            <div style={{ fontWeight: '600' }}>Адміністратор Клубу</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <MessageSquare className="accent" size={28} /> Активні обговорення
        </h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
          {showCreateForm ? 'Скасувати' : 'Створити обговорення'}
        </button>
      </div>

      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass" 
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h3 style={{ marginBottom: '1.5rem' }}>Нове обговорення</h3>
          <form onSubmit={handleCreateDiscussion} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Книга для обговорення</label>
              <select 
                value={newDiscData.book_id}
                onChange={(e) => setNewDiscData({...newDiscData, book_id: e.target.value})}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white' }}
                required
              >
                <option value="" style={{ color: 'black' }}>Оберіть книгу...</option>
                {books.map(b => (
                  <option key={b.id} value={b.id} style={{ color: 'black' }}>{b.title}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Тема обговорення</label>
              <input 
                type="text"
                value={newDiscData.topic}
                onChange={(e) => setNewDiscData({...newDiscData, topic: e.target.value})}
                placeholder="Наприклад: 'Головна думка автора'"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Створити</button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {discussions.map((disc) => (
          <motion.div 
            key={disc.id} 
            className="glass" 
            style={{ padding: '2rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div style={{ display: 'flex', gap: '2rem' }}>
              <img src={disc.book.cover_url} alt="Cover" style={{ width: '120px', borderRadius: '12px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                  <Book size={18} /> {disc.book.title}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{disc.topic}</h3>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {disc.comments.map(comment => (
                      <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                        <img src={comment.user.avatar_url} alt="A" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comment.user.username} • {new Date(comment.created_at).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.95rem' }}>{comment.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="Напишіть коментар..." 
                      value={newComment[disc.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [disc.id]: e.target.value })}
                      style={{ flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white' }}
                    />
                    <button onClick={() => handleAddComment(disc.id)} className="btn-primary" style={{ padding: '0.75rem' }}>
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClubDetail;
