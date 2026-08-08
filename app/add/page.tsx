'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ type: 'فرح', name: '', date: '', location: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userCaptcha, setUserCaptcha] = useState('');

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
    if (localStorage.getItem('is_admin') === 'true') setIsAdmin(true);
  }, []);

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
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, id: String(Date.now()) }),
    });
    setLoading(false);
    
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: '30px 16px', fontFamily: 'system-ui, sans-serif', direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto', flex: 1, width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>إضافة مناسبة جديدة</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>املأ التفاصيل لإضافتها للجدول</p>
          </div>
          <button 
            type="button"
            onClick={() => router.push('/')} 
            style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #475569', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            ← العودة للجدول
          </button>
        </div>

        <form onSubmit={handleSaveEvent} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            <input type="text" placeholder="اسم صاحب المناسبة" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                <input type="radio" name="eventType" value="فرح" checked={formData.type === 'فرح'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> فرح
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#fff' }}>
                <input type="radio" name="eventType" value="عشاء" checked={formData.type === 'عشاء'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> عشاء
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>تاريخ المناسبة</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
            </div>

            <input type="text" placeholder="الموقع" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            <input type="tel" placeholder="رقم الهاتف" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {!isAdmin && (
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #475569' }}>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>كم الناتج {num1} + {num2} = ؟</span>
              <input type="number" required value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', textAlign: 'center', marginTop: '8px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
              {loading ? 'جاري الحفظ...' : 'حفظ وإضافة للمناسبات'}
            </button>
            <button type="button" onClick={() => router.push('/')} style={{ padding: '14px 20px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>إلغاء</button>
          </div>
        </form>

      </div>
    </div>
  );
}