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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2b1220 0%, #150a14 50%, #0d060f 100%)', color: '#fce7f3', padding: '30px 16px', fontFamily: 'system-ui, sans-serif', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        {/* الهيدر */}
        <div style={{ textAlign: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(244, 114, 182, 0.2)', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f472b6', letterSpacing: '-0.5px' }}>مناسبات البراعصه</h1>
          <p style={{ fontSize: '13px', color: '#f472b6', opacity: 0.7, marginTop: '5px' }}>تابع أحدث الأفراح والعشاء بكل سهولة</p>
        </div>

        {/* نافذة تسجيل الدخول للمدير */}
        {showLoginModal && !isAdmin && (
          <div style={{ backgroundColor: 'rgba(30, 10, 25, 0.95)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)', marginBottom: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#fce7f3' }}>تسجيل دخول المدير</h3>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(244, 114, 182, 0.4)', backgroundColor: '#12050e', color: '#fff', fontSize: '14px', outline: 'none' }} 
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#db2777', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                دخول
              </button>
            </form>
          </div>
        )}

        {/* قائمة المناسبات (مصممة خصيصاً لتكون واضحة جداً على الهواتف) */}
        <div style={{ backgroundColor: 'rgba(26, 11, 22, 0.85)', padding: '20px', borderRadius: '20px', marginBottom: '35px', border: '1px solid rgba(244, 114, 182, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fce7f3', marginBottom: '20px', borderRight: '4px solid #db2777', paddingRight: '10px' }}>المناسبات القادمة</h2>
          
          {fetching && events.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#f472b6', opacity: 0.7 }}>جاري التحميل...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#f472b6', opacity: 0.7 }}>لا توجد مناسبات مضافة حالياً</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredEvents.map((ev) => (
                <div key={ev.id} style={{ backgroundColor: '#150a14', padding: '16px', borderRadius: '14px', border: '1px solid rgba(244, 114, 182, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(219, 39, 119, 0.15)', color: '#f472b6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {ev.type}
                    </span>
                    <span style={{ fontSize: '13px', color: '#f472b6', opacity: 0.9 }}>📅 {ev.date}</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                    {ev.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 {ev.location}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button onClick={() => handleEdit(ev)} style={{ flex: 1, padding: '6px', backgroundColor: '#db2777', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>تعديل</button>
                      <button onClick={() => handleDelete(ev.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#991b1b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>حذف</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* نموذج الإضافة أو التعديل */}
        <form onSubmit={handleSaveEvent} style={{ backgroundColor: 'rgba(26, 11, 22, 0.85)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(244, 114, 182, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fce7f3', marginBottom: '20px', borderRight: '4px solid #db2777', paddingRight: '10px' }}>
            {editingId ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#f472b6', marginBottom: '8px' }}>اسم صاحب المناسبة</label>
              <input type="text" placeholder="الاسم الثلاثي" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#12050e', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#f472b6', marginBottom: '8px' }}>نوع المناسبة</label>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '48px', padding: '0 14px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#12050e' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                  <input type="radio" name="eventType" value="فرح" checked={formData.type === 'فرح'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ accentColor: '#db2777', width: '16px', height: '16px' }} />
                  فرح
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                  <input type="radio" name="eventType" value="عشاء" checked={formData.type === 'عشاء'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ accentColor: '#db2777', width: '16px', height: '16px' }} />
                  عشاء
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#f472b6', marginBottom: '8px' }}>التاريخ</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#12050e', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#f472b6', marginBottom: '8px' }}>الموقع</label>
              <input type="text" placeholder="اسم الصالة أو المكان" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#12050e', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#f472b6', marginBottom: '8px' }}>رقم الهاتف</label>
              <input type="tel" placeholder="965XXXXXXXX" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#12050e', color: '#fff', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>

          {/* خانة التحقق للزوار */}
          {!isAdmin && (
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#12050e', borderRadius: '12px', border: '1px solid rgba(244, 114, 182, 0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                أثبت أنك لست روبوت: كم الناتج <strong style={{ color: '#f472b6' }}>{num1} + {num2}</strong> = ؟
              </span>
              <input 
                type="number" 
                required 
                placeholder="أدخل الناتج هنا" 
                value={userCaptcha} 
                onChange={(e) => setUserCaptcha(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(244, 114, 182, 0.3)', backgroundColor: '#1a0b16', color: '#fff', fontSize: '14px', textAlign: 'center', outline: 'none' }} 
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', backgroundColor: '#db2777', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(219, 39, 119, 0.4)' }}>
              {loading ? 'جاري الحفظ...' : editingId ? 'تعديل المناسبة' : 'إضافة المناسبة'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ type: 'فرح', name: '', date: '', location: '', phone: '' }); }} style={{ padding: '14px 20px', backgroundColor: '#4a1d33', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* الفوتر مع زر دخول المدير الصغير في أقصى الزاوية */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', padding: '10px 5px', borderTop: '1px solid rgba(244, 114, 182, 0.15)', fontSize: '12px' }}>
        <div style={{ color: '#f472b6', opacity: 0.6 }}>
          تم برمجة وتطوير الموقع بواسطة 
          <a href="https://na9er.net" target="_blank" rel="noopener noreferrer" style={{ color: '#f472b6', textDecoration: 'none', fontWeight: '700', marginRight: '4px' }}>
            Tech idea
          </a>
        </div>
        
        <button 
          onClick={() => {
            if (isAdmin) {
              handleLogout();
            } else {
              setShowLoginModal(!showLoginModal);
            }
          }} 
          style={{ background: 'transparent', border: 'none', color: '#f472b6', opacity: 0.4, cursor: 'pointer', fontSize: '11px', padding: '4px' }}
        >
          {isAdmin ? 'خروج المدير' : 'دخول المدير'}
        </button>
      </footer>
    </div>
  );
}