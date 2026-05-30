import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DatePicker({ value, onChange, style, align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const date = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(date.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(date.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectDay = (day) => {
    const yyyy = currentYear;
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const days = [];
  for (let i = 0; i < adjustedFirstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const daysOfWeekShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  const formattedDate = value ? (() => {
    const d = new Date(value + 'T00:00:00');
    const dd = d.getDate();
    const mm = monthNames[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd} ${mm} ${yyyy}`;
  })() : 'Pilih Tanggal';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', minWidth: 140, ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          height: '38px',
          padding: '0 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 150ms ease',
          outline: 'none',
        }}
      >
        <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
        <span>{formattedDate}</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          ...(align === 'left' ? { left: 0 } : { right: 0 }),
          zIndex: 150,
          width: '280px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button type="button" onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {daysOfWeekShort.map(lbl => (
              <div key={lbl} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {lbl}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              
              const isSelected = value && (() => {
                const d = new Date(value + 'T00:00:00');
                return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
              })();

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  style={{
                    height: '28px',
                    width: '100%',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-primary-500)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseOver={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--color-neutral-100)';
                  }}
                  onMouseOut={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
