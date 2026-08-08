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
        alert('رمز التحقق غير صحيح، يرجى إعادة المحاولة للتأكد من أنك لست روبوت');
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
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: '30px 16px', fontFamily: 'system-ui, sans-serif', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>مناسبات البراعصه</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '5px' }}>جدول المواعيد والمناسبات الرسمية</p>
        </div>

        {showLoginModal && !isAdmin && (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '30px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#f8fafc' }}>تسجيل دخول المدير</h3>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none' }} 
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                دخول
              </button>
            </form>
          </div>
        )}

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '20px', borderRight: '4px solid #3b82f6', paddingRight: '10px' }}>المناسبات القادمة</h2>
          
          {fetching && events.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>لا توجد مناسبات مضافة حالياً</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredEvents.map((ev) => (
                <div key={ev.id} style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {ev.type}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{ev.date}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                    {ev.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    📍 {ev.location}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                      <button onClick={() => handleEdit(ev)} style={{ flex: 1, padding: '6px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>تعديل</button>
                      <button onClick={() => handleDelete(ev.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>حذف</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSaveEvent} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '20px', borderRight: '4px solid #3b82f6', paddingRight: '10px' }}>
            {editingId ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            <input type="text" placeholder="اسم صاحب المناسبة" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px' }} />
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                <input type="radio" name="eventType" value="فرح" checked={formData.type === 'فرح'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> فرح
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                <input type="radio" name="eventType" value="عشاء" checked={formData.type === 'عشاء'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> عشاء
              </label>
            </div>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
            <input type="text" placeholder="الموقع" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
            <input type="tel" placeholder="رقم الهاتف" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }} />
          </div>

          {!isAdmin && (
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #475569' }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>كم الناتج {num1} + {num2} = ؟</span>
              <input type="number" required value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', textAlign: 'center', marginTop: '8px' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
              {loading ? 'جاري الحفظ...' : editingId ? 'تعديل' : 'إضافة'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ type: 'فرح', name: '', date: '', location: '', phone: '' }); }} style={{ padding: '14px 20px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '10px' }}>إلغاء</button>
            )}
          </div>
        </form>
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', padding: '10px 5px', borderTop: '1px solid #1e293b', fontSize: '12px' }}>
        <div style={{ color: '#64748b' }}>
          تم برمجة وتطوير الموقع بواسطة <a href="https://na9er.net" target="_blank" style={{ color: '#38bdf8', fontWeight: '700' }}>Tech idea</a>
        </div>
        <button onClick={() => isAdmin ? handleLogout() : setShowLoginModal(!showLoginModal)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '10px' }}>
          {isAdmin ? 'خروج المدير' : 'دخول المدير'}
        </button>
      </footer>
    </div>
  );
}