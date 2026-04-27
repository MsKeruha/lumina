import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const [books, setBooks] = useState([]);

  // Mock data for initial look
  const mockBooks = [
    { id: 1, title: "Дюна", author: "Френк Герберт", rating: 4.9, cover_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400" },
    { id: 2, title: "1984", author: "Джордж Орвелл", rating: 4.8, cover_url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400" },
    { id: 3, title: "Великий Гетсбі", author: "Ф. Скотт Фіцджеральд", rating: 4.7, cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400" },
    { id: 4, title: "Гобіт", author: "Дж. Р. Р. Толкін", rating: 4.9, cover_url: "https://images.unsplash.com/photo-1621351123081-794d40092486?q=80&w=400" },
  ];

  useEffect(() => {
    // Fetch from FastAPI backend
    fetch('http://localhost:8000/books')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Sort by rating descending to show truly 'popular' books
          const sorted = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setBooks(sorted);
        }
        else setBooks(mockBooks);
      })
      .catch(() => setBooks(mockBooks));
  }, []);

  return (
    <div className="home-page">
      <header className="hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Освітіть свій <br /> шлях читання</h1>
          <p>Приєднуйтесь до ексклюзивних книжкових клубів, відстежуйте свій прогрес та беріть участь у глибоких літературних дискусіях зі спільнотою, що розділяє вашу пристрасть.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/register">
              <button className="btn-primary">
                Почати <ArrowRight size={20} />
              </button>
            </Link>
            <Link to="/clubs">
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                Дослідити клуби
              </button>
            </Link>
          </div>
        </motion.div>
      </header>

      <section className="content-section">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles className="accent" size={24} />
            <h2>Популярне цього тижня</h2>
          </div>
          <Link to="/discover" className="nav-link">Дивитися все</Link>
        </div>
        
        <div className="book-grid home-grid">
          {books.slice(0, 4).map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
