'use client';
import { useState, useEffect } from 'react';

interface EventItem {
  id?: number | string;
  type: string;
  name: string;
  date: string;
  location: string;
  phone?: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [formData, setFormData] = useState({ type: 'فرح', name: '', date: '', location: '', phone: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userCaptcha, setUserCaptcha] = useState('');

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserCaptcha('');
  };

  const fetchEvents = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    generateCaptcha();
    if (localStorage.getItem('is_admin') === 'true') setIsAdmin(true);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '12345') {
      setIsAdmin(true);
      localStorage.setItem('is_admin', 'true');
      setShowLoginModal(false);
      setAdminPassword('');
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('is_admin');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.location || !formData.phone) {
      alert('يرجى تعبئة كافة البيانات');
      return;
    }

    if (!isAdmin) {
      if (parseInt(userCaptcha) !== num1 + num2) {
        alert('رمز التحقق غير صحيح');
        generateCaptcha();
        return;
      }
    }

    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    await fetch('/api/events', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, id: editingId || String(Date.now()) }),
    });
    setLoading(false);
    setFormData({ type: 'فرح', name: '', date: '', location: '', phone: '' });
    setEditingId(null);
    generateCaptcha();
    fetchEvents();
  };

  const now = new Date().getTime();
  const filteredEvents = events
    .filter((ev) => ev.date && new Date(ev.date).getTime() >= now - 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#ffffff', padding: '30px 16px', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>مناسبات البراعةصة</h1>
        </div>

        {showLoginModal && !isAdmin && (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' }}>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px' }}>
              <input type="password" placeholder="كلمة المرور" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff' }} />
              <button type="submit" style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px' }}>دخول</button>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', marginBottom: '35px' }}>
          {filteredEvents.map((ev) => (
            <div key={ev.id} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{ev.type}</span>
                <span style={{ color: '#ffffff' }}>{ev.date}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{ev.name}</div>
              <div style={{ color: '#94a3b8' }}>{ev.location}</div>
            </div>
          ))}
        </div>

        {/* نموذج الإضافة */}
        <form onSubmit={handleSaveEvent} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px' }}>
           <h3 style={{ marginBottom: '20px' }}>إضافة مناسبة جديدة</h3>
           {/* ... نفس حقول الإدخال السابقة ... */}
        </form>
      </div>

      <footer style={{ marginTop: '50px', textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
        <div style={{ color: '#475569', fontSize: '12px', marginBottom: '10px' }}>
          © 2026 Tech idea Co. All rights reserved.
        </div>
        <button 
          onClick={() => isAdmin ? handleLogout() : setShowLoginModal(!showLoginModal)} 
          style={{ background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '10px' }}
        >
          {isAdmin ? 'Admin Logout' : 'Admin Login'}
        </button>
      </footer>
    </div>
  );
}