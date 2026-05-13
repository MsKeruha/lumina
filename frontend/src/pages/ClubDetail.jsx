import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Calendar, User, Send, Book, LogIn, LogOut, PieChart, PlusCircle, CheckCircle2, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import CustomSelect from '../components/CustomSelect';


const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [books, setBooks] = useState([]);
  const [newDiscData, setNewDiscData] = useState({ topic: '', book_id: '' });
  const { user } = useAuth();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDeleteClubModalOpen, setIsDeleteClubModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Poll integration states
  const [poll, setPoll] = useState(null);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [selectedPollBooks, setSelectedPollBooks] = useState([]); // list of selected ids

  useEffect(() => {
    fetchClubDetails();
    fetchPollDetails();
    fetch(`/api/clubs/${clubId}/discussions`)
      .then(res => res.json())
      .then(data => setDiscussions(data));

    fetch('/api/books')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, [clubId]);

  const fetchClubDetails = () => {
    fetch(`/api/clubs/${clubId}`)
      .then(res => res.json())
      .then(data => setClub(data));
  };

  const fetchPollDetails = async () => {
    try {
      const res = await fetch(`/api/clubs/${clubId}/polls`);
      if (res.ok) {
        const data = await res.json();
        setPoll(data); // Can be null if no active polls
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (optionId) => {
    if (!user) {
      setToast({ message: 'Будь ласка, увійдіть, щоб проголосувати', type: 'error' });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/polls/vote/${optionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Голос зараховано!', type: 'success' });
        fetchPollDetails(); // Refresh poll percentages
      } else {
        const errData = await res.json();
        setToast({ message: errData.detail || 'Не вдалося проголосувати', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (selectedPollBooks.length < 2) {
      setToast({ message: 'Оберіть мінімум 2 книги для голосування', type: 'error' });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/${clubId}/polls`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: pollTitle, 
          book_ids: selectedPollBooks.map(Number) 
        })
      });
      if (res.ok) {
        setToast({ message: 'Голосування створено!', type: 'success' });
        setIsPollModalOpen(false);
        setPollTitle('');
        setSelectedPollBooks([]);
        fetchPollDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePollBookSelect = (bookId) => {
    if (selectedPollBooks.includes(bookId)) {
      setSelectedPollBooks(selectedPollBooks.filter(id => id !== bookId));
    } else {
      if (selectedPollBooks.length >= 5) {
        setToast({ message: 'Максимум 5 варіантів', type: 'error' });
        return;
      }
      setSelectedPollBooks([...selectedPollBooks, bookId]);
    }
  };


  const handleJoinClub = async () => {
    if (!user) {
      setToast({ message: 'Будь ласка, увійдіть, щоб вступити в клуб', type: 'error' });
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Ви успішно приєдналися!', type: 'success' });
        fetchClubDetails();
      } else {
        setToast({ message: 'Не вдалося приєднатися до клубу', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    }
  };

  const handleConfirmLeave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/${clubId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Ви вийшли з клубу', type: 'success' });
        setIsLeaveModalOpen(false);
        // Redirect back to list of clubs since user is no longer inside
        setTimeout(() => navigate('/clubs'), 1500);
      } else {
        setToast({ message: 'Помилка при спробі вийти з клубу', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    }
  };

  const handleConfirmDeleteClub = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Клуб успішно видалено!', type: 'success' });
        setIsDeleteClubModalOpen(false);
        setTimeout(() => navigate('/clubs'), 1500);
      } else {
        const errData = await res.json();
        setToast({ message: errData.detail || 'Не вдалося видалити клуб', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Помилка мережі', type: 'error' });
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!user) {
      setToast({ message: 'Увійдіть, щоб створити обговорення', type: 'error' });
      return;
    }
    if (!newDiscData.book_id) {
      setToast({ message: 'Будь ласка, оберіть книгу для обговорення', type: 'error' });
      return;
    }
    
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clubs/${clubId}/discussions`, {
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
      setToast({ message: 'Тему обговорення успішно створено!', type: 'success' });
      // Refresh discussions
      const discRes = await fetch(`/api/clubs/${clubId}/discussions`);
      const discData = await discRes.json();
      setDiscussions(discData);
    } else {
      setToast({ message: 'Помилка при створенні обговорення', type: 'error' });
    }
  };

  const handleAddComment = async (discussionId) => {
    if (!user) {
      setToast({ message: 'Увійдіть, щоб коментувати', type: 'error' });
      return;
    }
    const content = newComment[discussionId];
    if (!content) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/discussions/${discussionId}/comments`, {
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
      const discRes = await fetch(`/api/clubs/${clubId}/discussions`);
      const discData = await discRes.json();
      setDiscussions(discData);
    } else {
      setToast({ message: 'Помилка при відправці коментаря', type: 'error' });
    }
  };


  if (!club) return <div style={{ padding: '4rem', textAlign: 'center' }}>Завантаження...</div>;

  const isMember = user && club.members?.some(m => m.id === user.id);
  const isCreator = user && club.creator_id === user.id;
  const creatorUser = club.members?.find(m => m.id === club.creator_id);

  return (
    <div className="content-section">
      {/* Club Main Glass Header Block */}
      <div className="glass" style={{ padding: '3rem', marginBottom: '3rem', borderRadius: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{club.name}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: 0 }}>{club.description}</p>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Куратор клубу</div>
              <div style={{ fontWeight: '600' }}>
                {isCreator ? (
                  'Ви керуєте цим клубом'
                ) : creatorUser ? (
                  <Link to={`/users/${creatorUser.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    @{creatorUser.username}
                  </Link>
                ) : (
                  'Невідомий куратор'
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {isCreator && (
                <button 
                  onClick={() => setIsDeleteClubModalOpen(true)}
                  className="btn-primary"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                >
                  <Trash2 size={18} /> Видалити мій клуб
                </button>
              )}
              {!isCreator && isMember && (
                <button 
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="btn-primary"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                >
                  <LogOut size={18} /> Покинути клуб
                </button>
              )}
              {!isMember && (
                <button 
                  onClick={handleJoinClub}
                  className="btn-primary"
                >
                  <LogIn size={18} /> Приєднатися до клубу
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.1fr', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Discussions Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <MessageSquare className="accent" size={28} /> Активні обговорення
            </h2>
            {isMember && (
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                Створити тему
              </button>
            )}
          </div>

          {discussions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {discussions.map((disc) => (
                <motion.div 
                  key={disc.id} 
                  className="glass" 
                  style={{ padding: '2rem' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <img src={disc.book.cover_url} alt="Cover" style={{ width: '100px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                        <Book size={16} /> {disc.book.title}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>{disc.topic}</h3>
                      
                      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                          {disc.comments.length > 0 ? disc.comments.map(comment => (
                            <div key={comment.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                              <Link to={`/users/${comment.user_id}`} style={{ flexShrink: 0 }}>
                                <img 
                                  src={comment.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.username}`} 
                                  alt="A" 
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} 
                                />
                              </Link>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                  <Link to={`/users/${comment.user_id}`} style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600' }}>
                                    {comment.user.username}
                                  </Link> • {new Date(comment.created_at).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.4 }}>{comment.content}</div>
                              </div>
                            </div>
                          )) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Поки що коментарів немає. Будьте першим!</p>
                          )}
                        </div>

                        {isMember && (
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input 
                              type="text" 
                              placeholder="Напишіть свою думку..." 
                              value={newComment[disc.id] || ''}
                              onChange={(e) => setNewComment({ ...newComment, [disc.id]: e.target.value })}
                              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: 'white', fontSize: '0.9rem' }}
                            />
                            <button onClick={() => handleAddComment(disc.id)} className="btn-primary" style={{ padding: '0.6rem' }}>
                              <Send size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
              <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>В цьому клубі ще немає активних обговорень.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Sidebar Widget (Poll) */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
            
            {poll ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <PieChart className="accent" size={20} />
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Голосування Клубу</h3>
                </div>
                
                <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#fff' }}>{poll.title}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(() => {
                    const total = poll.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0);
                    const userVoteOption = poll.options.find(o => o.votes?.some(v => v.user_id === user?.id));

                    return poll.options.map(opt => {
                      const count = opt.votes?.length || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <div 
                          key={opt.id}
                          onClick={() => isMember && handleVote(opt.id)}
                          className="glass"
                          style={{ 
                            padding: '0.75rem', 
                            borderRadius: '10px', 
                            position: 'relative', 
                            cursor: isMember ? 'pointer' : 'default',
                            overflow: 'hidden',
                            border: userVoteOption?.id === opt.id ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.01)',
                            transition: 'border-color 0.2s'
                          }}
                        >
                          {/* Backing progress bar fill */}
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: 'rgba(99, 102, 241, 0.08)', width: `${pct}%`, zIndex: 0, transition: 'width 0.5s ease' }} />
                          
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <img src={opt.book.cover_url} alt="C" style={{ width: '35px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.book.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                <span>{pct}%</span>
                                <span>{count} гол.</span>
                              </div>
                            </div>

                            {userVoteOption?.id === opt.id && (
                              <CheckCircle2 size={16} className="accent" />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                  Всього віддано голосів: {poll.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <PieChart size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.6 }} />
                <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Немає активних опитувань</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Зараз у цьому клубі не проходить вибір наступної книги для спільного читання.</p>
              </div>
            )}

            {/* Curator admin poll launcher controls */}
            {isCreator && (
              <button 
                onClick={() => setIsPollModalOpen(true)}
                style={{ 
                  marginTop: '1.5rem', 
                  width: '100%', 
                  padding: '0.65rem', 
                  background: 'none', 
                  border: '1px dashed rgba(99, 102, 241, 0.4)', 
                  color: 'var(--primary)', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <PlusCircle size={14} /> Створити опитування
              </button>
            )}

          </div>

          {/* Members Widget */}
          <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Users className="accent" size={20} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Учасники Клубу</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {club.members?.map(member => (
                <Link 
                  key={member.id} 
                  to={`/users/${member.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  <img 
                    src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} 
                    alt={member.username} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--glass-bg)', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} 
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="hover-underline">{member.username}</span>
                      {member.id === club.creator_id && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(147, 51, 234, 0.2)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '99px' }}>куратор</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.id === user?.id ? 'Це ви' : 'Читач'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal for Creating Discussion */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Нове обговорення"
      >
        <form onSubmit={handleCreateDiscussion} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Книга для обговорення</label>
            <CustomSelect 
              value={newDiscData.book_id}
              onChange={(val) => setNewDiscData({...newDiscData, book_id: val})}
              placeholder="📖 Оберіть книгу..."
              options={[
                { value: '', label: '📖 Оберіть книгу...' },
                ...books.map(b => ({ value: b.id, label: b.title }))
              ]}
            />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Тема обговорення</label>
            <input 
              type="text"
              value={newDiscData.topic}
              onChange={(e) => setNewDiscData({...newDiscData, topic: e.target.value})}
              placeholder="Наприклад: 'Головна думка автора'"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Скасувати
            </button>
            <button type="submit" className="btn-primary">Створити</button>
          </div>
        </form>
      </Modal>

      {/* Modal for Launching Club Poll */}
      <Modal
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        title="Створити голосування за книгу"
      >
        <form onSubmit={handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Питання голосування</label>
            <input 
              type="text"
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              placeholder="Яку книгу читаємо наступною?"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
              required
            />
          </div>
          
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Оберіть варіанти (2-5 книг)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
              gap: '0.75rem', 
              maxHeight: '200px', 
              overflowY: 'auto', 
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px'
            }}>
              {books.map(b => {
                const isSelected = selectedPollBooks.includes(b.id);
                return (
                  <div 
                    key={b.id} 
                    onClick={() => togglePollBookSelect(b.id)}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '0.5rem', 
                      borderRadius: '8px', 
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent', 
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={b.cover_url} alt="B" style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>{b.title}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Вибрано книг: {selectedPollBooks.length} з 5</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={() => setIsPollModalOpen(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Скасувати
            </button>
            <button type="submit" className="btn-primary" disabled={selectedPollBooks.length < 2}>Запустити</button>
          </div>
        </form>
      </Modal>

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Покинути клуб"
        footer={
          <>
            <button 
              onClick={() => setIsLeaveModalOpen(false)}
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
          Ви дійсно впевнені, що бажаєте вийти з книжкового клубу <strong>"{club.name}"</strong>? 
          Ви втратите можливість створювати обговорення та залишати коментарі, поки не приєднаєтесь знову.
        </p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteClubModalOpen}
        onClose={() => setIsDeleteClubModalOpen(false)}
        title="Видалити книжковий клуб"
        footer={
          <>
            <button 
              onClick={() => setIsDeleteClubModalOpen(false)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
            >
              Скасувати
            </button>
            <button 
              onClick={handleConfirmDeleteClub}
              style={{ background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
            >
              Так, видалити клуб назавжди
            </button>
          </>
        }
      >
        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
          Ви дійсно впевнені, що бажаєте <strong>видалити ваш клуб "{club.name}"</strong>?<br/><br/>
          <span style={{ color: '#f87171', fontWeight: '600' }}>⚠️ Ця дія є незворотною!</span> Усі обговорення, коментарі та результати голосувань будуть видалені назавжди без можливості відновлення.
        </p>
      </Modal>

      {/* Toast System */}
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

export default ClubDetail;
