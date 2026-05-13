import React from 'react';
import { Cpu, BrainCircuit, Sigma, ShieldCheck, Database, Code, BookOpen, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutAlgorithms = () => {
  return (
    <motion.div 
      className="content-section" 
      style={{ maxWidth: '1000px', margin: '0 auto' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(129, 140, 248, 0.1)', 
          color: 'var(--primary)', 
          padding: '0.5rem 1.25rem', 
          borderRadius: '99px',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '1rem',
          border: '1px solid rgba(129, 140, 248, 0.2)'
        }}>
          <Cpu size={16} /> Технологічна Документація Проекту
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Алгоритмічні Модулі Lumina</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          Детальний опис логіки побудови інтелектуальних рекомендацій та системи динамічних досягнень, розроблених у рамках веб-додатку.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        
        {/* SECTION 1: RECOMMENDATION SYSTEM */}
        <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '0.75rem', borderRadius: '16px', color: 'white' }}>
              <BrainCircuit size={28} />
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>1. Модель AI-Рекомендацій (Content-Based Filtering)</h2>
          </div>

          <p style={{ lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1.5rem' }}>
            Для персоналізації досвіду читачів у Lumina реалізована система рекомендацій на основі аналізу контенту (<strong>Content-Based Recommendation</strong>). Модуль написаний на Python з використанням бібліотек аналізу текстових даних.
          </p>

          <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sigma size={20} className="accent" /> Формула подібності (Jaccard Index / Overlap Coefficient)
          </h3>
          
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            border: '1px solid var(--glass-border)', 
            fontFamily: 'monospace', 
            color: '#a5b4fc',
            fontSize: '1.1rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            Score(B₁, B₂) = |Tags(B₁) ∩ Tags(B₂)| / min(|Tags(B₁)|, |Tags(B₂)|)
          </div>

          <p style={{ lineHeight: '1.8', color: '#94a3b8', marginBottom: '1.5rem' }}>
            <strong>Як це працює на практиці:</strong>
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
            <li><strong>Етап 1: Векторизація.</strong> Кожна книга у базі проходить автоматичну токенізацію описів, жанру та тегів, перетворюючись на набір ключових слів-термів (Tags Vector).</li>
            <li><strong>Етап 2: Перетин множин.</strong> При відкритті конкретної книги алгоритм порівнює її вектор тегів із рештою каталогу бібліотеки.</li>
            <li><strong>Етап 3: Ранжування.</strong> Розраховується коефіцієнт перекриття (Overlap Similarity) з додатковою вагою для співпадіння категорії. Результати сортуються за спаданням оцінки з лімітом у 5 книг.</li>
          </ul>
        </div>

        {/* SECTION 2: DYNAMIC ACHIEVEMENT ENGINE */}
        <div className="glass" style={{ padding: '3rem', borderRadius: '32px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '0.75rem', borderRadius: '16px', color: 'white' }}>
              <Code size={28} />
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>2. Движок Динамічних Досягнень (Dynamic Formula Parser)</h2>
          </div>

          <p style={{ lineHeight: '1.8', color: '#cbd5e1', marginBottom: '1.5rem' }}>
            Система гейміфікації використовує розроблений інтерпретатор математичних правил. Він дозволяє адміністраторам сайту створювати складні умови нагород без модифікації вихідного Python-коду.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', margin: '0 0 0.75rem 0' }}>
                <Database size={16} className="accent" /> Об'єкт Метрик (State Map)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                Бэкенд формує словник поточного стану користувача:
              </p>
              <pre style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace', margin: 0 }}>
{`{
  "books_read": X,      # прочитано
  "comments_posted": Y, # коментарів
  "pages_read": Z,      # сума сторінок
  "polls_voted": N      # голосувань
}`}
              </pre>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', margin: '0 0 0.75rem 0' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} /> Безпечна Обробка (Sandboxed)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
                Парсер захищає систему від ін'єкцій коду:
              </p>
              <ol style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', margin: 0 }}>
                <li>Символьна валідація через регулярні вирази Regex.</li>
                <li>Підстановка чисел замість змінних.</li>
                <li>Ізольований виклик <code>eval()</code> без доступу до <code>__builtins__</code>.</li>
              </ol>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1.25rem' }}>Приклади гнучких правил для ачивок:</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '16px', border: '1px dashed rgba(129,140,248,0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Арифметична формула (Накопичення)</div>
              <div style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                books_read * 100 + pages_read
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Система підраховує підсумковий бал користувача. Досягнення розблокується при досягненні заданої Цілі (наприклад, 1000).
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '16px', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Логічний вираз (Boolean condition)</div>
              <div style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                books_read &gt; 5 and polls_voted &gt;= 10
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Використовує порівняння та логічні зв'язки (<code>and</code>, <code>or</code>). Якщо вираз повертає <code>True</code>, прогрес стрибає до 100% (ціль ставиться = 1).
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM ARCHITECTURE OVERVIEW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <BookOpen className="accent" size={32} style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>SPA Frontend</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>React.js + Context API для реактивного рендерингу та миттєвих переходів без перезавантажень сторінки.</p>
          </div>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Cpu className="accent" size={32} style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>REST API Backend</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>FastAPI (Python) з автоматичною серіалізацією Pydantic моделей та асинхронною обробкою запитів.</p>
          </div>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Database className="accent" size={32} style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Relational Storage</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>PostgreSQL + SQLAlchemy ORM для забезпечення ACID-гарантій при складних зв'язках M2M (клуби, голоси).</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AboutAlgorithms;
