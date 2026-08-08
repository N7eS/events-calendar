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
    fetchEvents();
  };

  const handleEdit = (ev: EventItem) => {
    setEditingId(String(ev.id));
    setFormData({
      type: ev.type,
      name: ev.name,
      date: ev.date,
      location: ev.location,
      phone: ev.phone || ''
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id?: number | string) => {
    if (!id || !confirm('هل أنت متأكد من حذف هذه المناسبة؟')) return;
    await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchEvents();
  };

  const now = new Date().getTime();
  const filteredEvents = events
    .filter((ev) => ev.date && new Date(ev.date).getTime() >= now - 7 * 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f1f5f9', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        {/* الهيدر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#38bdf8', letterSpacing: '-0.5px' }}>روزنامة المناسبات</h1>
          <button 
            onClick={() => {
              if (isAdmin) {
                handleLogout();
              } else {
                setShowLoginModal(!showLoginModal);
              }
            }} 
            style={{ padding: '6px 14px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
          >
            {isAdmin ? 'خروج' : 'دخول المدير'}
          </button>
        </div>

        {/* نافذة تسجيل الدخول */}
        {showLoginModal && !isAdmin && (
          <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f8fafc' }}>تسجيل دخول المدير</h3>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }} 
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                دخول
              </button>
            </form>
          </div>
        )}

        {/* الجدول */}
        <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '20px' }}>المناسبات القادمة</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #1f2937', fontSize: '14px' }}>
                <th style={{ padding: '14px', textAlign: 'right' }}>التاريخ</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>المناسبة</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الموقع</th>
                {isAdmin && <th style={{ padding: '14px', textAlign: 'center' }}>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {fetching && events.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>جاري التحميل...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>لا توجد مناسبات مضافة حالياً</td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '14px', color: '#94a3b8', fontSize: '14px' }}>{ev.date}</td>
                    <td style={{ padding: '14px', fontWeight: '600', color: '#f8fafc' }}>
                      <span style={{ color: '#38bdf8', fontSize: '0.85em', marginLeft: '6px', fontWeight: '500' }}>({ev.type})</span>
                      {ev.name}
                    </td>
                    <td style={{ padding: '14px', color: '#cbd5e1', fontSize: '14px' }}>{ev.location}</td>
                    {isAdmin && (
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(ev)} style={{ padding: '4px 10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginLeft: '6px' }}>تعديل</button>
                        <button onClick={() => handleDelete(ev.id)} style={{ padding: '4px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>حذف</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* نموذج الإضافة أو التعديل */}
        <form onSubmit={handleSaveEvent} style={{ backgroundColor: '#111827', padding: '28px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '20px' }}>
            {editingId ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>اسم صاحب المناسبة</label>
              <input type="text" placeholder="الاسم الثلاثي" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>نوع المناسبة</label>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#090d16' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                  <input type="radio" name="eventType" value="فرح" checked={formData.type === 'فرح'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ accentColor: '#0284c7', width: '16px', height: '16px' }} />
                  فرح
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                  <input type="radio" name="eventType" value="عشاء" checked={formData.type === 'عشاء'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ accentColor: '#0284c7', width: '16px', height: '16px' }} />
                  عشاء
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>التاريخ</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>الموقع</label>
              <input type="text" placeholder="اسم الصالة أو المكان" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>رقم الهاتف</label>
            <input type="tel" placeholder="965XXXXXXXX" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              {loading ? 'جاري الحفظ...' : editingId ? 'تعديل المناسبة' : 'إضافة المناسبة'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ type: 'فرح', name: '', date: '', location: '', phone: '' }); }} style={{ padding: '14px 20px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '60px', padding: '20px', color: '#64748b', fontSize: '13px', borderTop: '1px solid #1e293b' }}>
        تم برمجة وتطوير الموقع بواسطة 
        <a href="https://na9er.net" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '700', marginRight: '5px' }}>
          Tech idea
        </a>
      </footer>
    </div>
  );
}