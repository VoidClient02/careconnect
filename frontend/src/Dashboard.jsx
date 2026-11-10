import { useEffect, useState } from 'react';
import { api } from './api';
import { Admin, Doctor, Nurse, Paramedic, Patient, Pharmacist } from './dashboards';

const VIEWS = {
  PATIENT: Patient,
  DOCTOR: Doctor,
  NURSE: Nurse,
  PARAMEDIC: Paramedic,
  PHARMACIST: Pharmacist,
  ADMIN: Admin,
};

const TITLES = {
  PATIENT: 'Patient operations',
  DOCTOR: 'Clinical dashboard',
  NURSE: 'Nursing operations',
  PARAMEDIC: 'Emergency response centre',
  PHARMACIST: 'Pharmacy fulfillment',
  ADMIN: 'Executive operating dashboard',
};

export default function Dashboard({ user, onExpired }) {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);

  const fail = (e) => { if (e.status === 401) onExpired(); else setMsg({ err: e.message }); };
  const load = () => api.get('/dashboard').then(setData).catch(fail);

  useEffect(() => { load(); }, []);

  const act = async (path, body) => {
    try { const r = await api.post(path, body); setMsg({ ok: r.message }); await load(); return true; }
    catch (e) { fail(e); return false; }
  };

  const View = VIEWS[user.role] || Patient;

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <p className="eyebrow">CareConnect operations</p>
          <h2>{TITLES[user.role] || 'Operations'}</h2>
        </div>
      </div>

      {msg && <p className={msg.err ? 'err' : 'note'}>{msg.err || msg.ok}</p>}
      {data ? <View data={data} act={act} /> : <p className="empty">Loading care dashboard…</p>}
    </>
  );
}
