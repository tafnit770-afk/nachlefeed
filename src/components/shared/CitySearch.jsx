// src/components/shared/CitySearch.jsx
import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { ISRAEL_CITIES } from '../../utils/israelCities';
import './CitySearch.css';

export default function CitySearch({ value, onChange, placeholder = 'חפש עיר או ישוב...', required = false }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // עדכן את הטופס גם בלי בחירה

    if (q.trim().length >= 1) {
      const q_lower = q.toLowerCase();
      const filtered = ISRAEL_CITIES
        .filter(city => {
          const c = city.toLowerCase();
          return c.includes(q_lower) || c.startsWith(q_lower);
        })
        .sort((a, b) => {
          const al = a.toLowerCase(), bl = b.toLowerCase();
          // עדיפות למתחילים עם החיפוש
          if (al.startsWith(q_lower) && !bl.startsWith(q_lower)) return -1;
          if (!al.startsWith(q_lower) && bl.startsWith(q_lower)) return 1;
          return al.localeCompare(bl, 'he');
        })
        .slice(0, 8);
      setResults(filtered);
      setShowResults(filtered.length > 0);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const selectCity = (city) => {
    setQuery(city);
    onChange(city);
    setShowResults(false);
    setFocused(false);
  };

  const clearCity = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlight = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>
          {text.slice(idx, idx + q.length)}
        </strong>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="city-search-wrapper" ref={wrapperRef}>
      <div className={`city-search-input-row ${focused ? 'focused' : ''}`}>
        <MapPin size={15} className="city-search-pin" />
        <input
          ref={inputRef}
          type="text"
          className="city-search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setShowResults(true);
          }}
          autoComplete="off"
          required={required}
        />
        {query && (
          <button type="button" className="city-search-clear" onClick={clearCity}>
            <X size={13} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="city-search-dropdown">
          {results.map(city => (
            <button
              key={city}
              type="button"
              className="city-search-item"
              onClick={() => selectCity(city)}
            >
              <MapPin size={13} className="city-item-icon" />
              <span>{highlight(city, query)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
