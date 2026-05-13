import React, { useState, useEffect } from 'react';
import { MessageCircle, Trophy, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Community = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/clubs/stats/summary');
        const statsData = await statsRes.json();
        
        const activityRes = await fetch('/api/clubs/community/activity');
        const activityData = await activityRes.json();

        setStats([
          { label: 'Активних читачів', value: statsData.users, icon: <Users size={24} /> },
          { label: 'Обговорень', value: statsData.discussions, icon: <MessageCircle size={24} /> },
          { label: 'Прочитаних книг', value: statsData.books, icon: <Trophy size={24} /> },
          { label: 'Росту спільноти', value: statsData.growth, icon: <TrendingUp size={24} /> },
        ]);
        
        setActivities(activityData);
      } catch (err) {
        console.error("Error fetching community data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="content-section">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Наша Спільнота</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
          Місце, де тисячі людей щодня діляться своїми думками про літературу та знаходять однодумців.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className="glass" 
            style={{ padding: '1.5rem', textAlign: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={24} className="accent" /> Остання активність
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                  {act.user[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: '600' }}>{act.user}</span> {act.action}{' '}
                  {act.target_id ? (
                    <Link to={`/clubs/${act.target_id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {act.target}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--primary)' }}>{act.target}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.time}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Немає недавньої активності</div>
            )}
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Стань частиною Lumina</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
            Ми будуємо найбільшу українську платформу для читацьких клубів. Твої ідеї та дискусії роблять нас кращими.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Users size={20} className="accent" /> Знаходь нових друзів</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><MessageCircle size={20} className="accent" /> Бери участь у живих дискусіях</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Trophy size={20} className="accent" /> Отримуй нагороди за активність</li>
          </ul>
          <Link to={user ? '/clubs' : '/register'} className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
            Приєднатися зараз
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Community;
