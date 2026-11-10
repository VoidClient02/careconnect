import { Card, StatCard, Table, Tag, useForm } from './ui';

const call = (a) => a.mode === 'VIRTUAL' && a.status === 'CONFIRMED' &&
  <> &middot; <a href={`https://meet.jit.si/CareConnect-${a.id}`} target="_blank" rel="noreferrer">Join call</a></>;

const casesCols = [['Time', (e) => e.at], ['Priority', (e) => <Tag v={e.priority} />], ['Patient', (e) => e.patient_name],
  ['Location', (e) => e.location], ['Condition', (e) => e.condition_desc], ['Paramedic', (e) => e.paramedic]];

const submitWith = (act, path, f, reset) => async (e) => { e.preventDefault(); if (await act(path, f)) reset(); };
const list = (value, fallback = []) => Array.isArray(value) ? value : fallback;

const PatientSelect = ({ bind, patients }) => (
  <select required {...bind('patientId')}><option value="">Patient...</option>
    {list(patients).map((p) => <option key={p.id} value={p.id}>{p.full_name || p.patient || p.name}</option>)}</select>
);

export function Patient({ data, act }) {
  const [f, bind, reset] = useForm({ doctorId: '', department: 'General Medicine', scheduledAt: '', mode: 'VIRTUAL', appointmentType: 'Follow-up', clinic: 'Main Campus', insurance: 'Private', priority: 'Routine', reason: '' });
  const appointments = list(data.appts, []);
  const prescriptions = list(data.rx, []);
  const vitals = list(data.vitals, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Upcoming visits" value={String(appointments.length)} trend="Next 14 days" tone="primary" />
        <StatCard label="Active meds" value={String(prescriptions.length)} trend="Current plan" tone="success" />
        <StatCard label="Latest vitals" value={String(vitals.length)} trend="Logged this month" tone="warning" />
        <StatCard label="Care score" value="92%" trend="Wellness index" tone="primary" />
      </div>

      <div className="split-layout">
        <Card title="Book an appointment">
          <form className="stack" onSubmit={submitWith(act, '/appointments/book', f, reset)}>
            <div className="row">
              <select required {...bind('doctorId')}>
                <option value="">Doctor...</option>
                {list(data.doctors).map((d) => <option key={d.id} value={d.id}>{d.full_name} – {d.specialty}</option>)}
              </select>
              <select {...bind('department')}>
                <option>General Medicine</option><option>Cardiology</option><option>Pediatrics</option><option>Dermatology</option><option>Orthopedics</option>
              </select>
            </div>

            <div className="row">
              <input type="datetime-local" required {...bind('scheduledAt')} />
              <select {...bind('mode')}><option value="IN_PERSON">In person</option><option value="VIRTUAL">Virtual telehealth</option></select>
            </div>

            <div className="row">
              <select {...bind('appointmentType')}>
                <option>Follow-up</option><option>Annual checkup</option><option>Consultation</option><option>Lab review</option>
              </select>
              <select {...bind('clinic')}>
                <option>Main Campus</option><option>City Clinic</option><option>Remote Care Hub</option>
              </select>
            </div>

            <div className="row">
              <select {...bind('insurance')}>
                <option>Private</option><option>Insured</option><option>Cash pay</option><option>Corporate</option>
              </select>
              <select {...bind('priority')}>
                <option>Routine</option><option>Priority</option><option>Urgent</option>
              </select>
            </div>

            <textarea placeholder="Reason for visit" required maxLength={255} {...bind('reason')} />
            <button type="submit">Request appointment</button>
          </form>
        </Card>

        <Card title="Care plan">
          <ul className="detail-list">
            <li><strong>Next review</strong> Cardiovascular follow-up scheduled for Friday 2:30 PM</li>
            <li><strong>Medication adherence</strong> 96% compliance over 30 days</li>
            <li><strong>Remote monitoring</strong> BP checks and glucose trend supported by telehealth</li>
            <li><strong>Care team</strong> Dr. L. Moyo · Nurse A. Peters · Pharmacy partner</li>
          </ul>
        </Card>
      </div>

      <div className="data-grid">
        <Card title="My appointments"><Table rows={appointments} cols={[['When', (a) => a.when_at], ['Doctor', (a) => `${a.doctor} (${a.specialty || 'Clinic'})`], ['Type', (a) => <>{a.mode}{call(a)}</>], ['Reason', (a) => a.reason], ['Status', (a) => <Tag v={a.status} />]]} /></Card>
        <Card title="My prescriptions"><Table rows={prescriptions} cols={[['Medication', (p) => p.medication], ['Dosage', (p) => p.dosage], ['Instructions', (p) => p.instructions], ['Doctor', (p) => p.doctor], ['Status', (p) => <Tag v={p.status} />]]} /></Card>
        <Card title="Latest vitals"><Table rows={vitals} empty="No readings yet." cols={[['When', (v) => v.at], ['BP', (v) => v.bp], ['Temp °C', (v) => v.temperature], ['Pulse', (v) => v.pulse]]} /></Card>
      </div>
    </>
  );
}

export function Doctor({ data, act }) {
  const [f, bind, reset] = useForm({ patientId: '', medication: '', dosage: '', instructions: '', department: 'General Medicine' });
  const appts = list(data.appts, []);
  const status = (a, s, label, cls = '') => <button type="button" className={`sm ${cls}`} onClick={() => act('/appointments/status', { id: a.id, status: s })}>{label}</button>;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Open cases" value={String(list(data.cases, []).length)} trend="Today" tone="primary" />
        <StatCard label="Appointments" value={String(appts.length)} trend="Scheduled" tone="success" />
        <StatCard label="Virtual consults" value="18" trend="Ongoing + booked" tone="warning" />
        <StatCard label="Avg. visit time" value="24 min" trend="Clinical efficiency" tone="primary" />
      </div>

      <div className="split-layout">
        <Card title="Clinical queue">
          <Table rows={appts} empty="No appointments." cols={[['When', (a) => a.when_at], ['Patient', (a) => a.patient], ['Type', (a) => <>{a.mode}{call(a)}</>], ['Reason', (a) => a.reason], ['Status', (a) => <Tag v={a.status} />], ['Action', (a) => (a.status === 'REQUESTED' || a.status === 'CONFIRMED') && <span className="row">{a.status === 'REQUESTED' && status(a, 'CONFIRMED', 'Confirm')}{a.status === 'CONFIRMED' && status(a, 'COMPLETED', 'Complete')}{status(a, 'CANCELLED', 'Cancel', 'red')}</span>]]} />
        </Card>

        <Card title="Care actions">
          <ul className="detail-list">
            <li><strong>Specialty allocation</strong> Cardiology and urgent intake are at 82% capacity</li>
            <li><strong>Follow-up queue</strong> 12 patients need post-visit review this afternoon</li>
            <li><strong>Care coordination</strong> 3 telehealth sessions scheduled with remote monitoring</li>
          </ul>
        </Card>
      </div>

      <div className="data-grid">
        <Card title="Write a prescription">
          <form className="stack" onSubmit={submitWith(act, '/prescriptions/create', f, reset)}>
            <div className="row">
              <PatientSelect bind={bind} patients={list(data.patients)} />
              <select {...bind('department')}>
                <option>General Medicine</option><option>Cardiology</option><option>Neurology</option><option>Pediatrics</option>
              </select>
            </div>
            <input placeholder="Medication" required maxLength={120} {...bind('medication')} />
            <input placeholder="Dosage" required maxLength={120} {...bind('dosage')} />
            <input placeholder="Instructions" maxLength={255} {...bind('instructions')} />
            <button type="submit">Send to pharmacy</button>
          </form>
        </Card>

        <Card title="Emergency cases"><Table rows={list(data.cases)} cols={casesCols} empty="No active cases." /></Card>
      </div>
    </>
  );
}

export function Nurse({ data, act }) {
  const [f, bind, reset] = useForm({ patientId: '', bp: '', temperature: '', pulse: '', notes: '', department: 'Ward 2' });
  const vitals = list(data.vitals, []);
  const appointments = list(data.appts, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Intake queue" value="14" trend="Patients waiting" tone="warning" />
        <StatCard label="Vitals logged" value={String(vitals.length)} trend="This shift" tone="success" />
        <StatCard label="Telehealth queue" value="6" trend="Remote follow-ups" tone="primary" />
        <StatCard label="Escalations" value="2" trend="Requires review" tone="danger" />
      </div>

      <div className="split-layout">
        <Card title="Record vitals">
          <form className="stack" onSubmit={submitWith(act, '/vitals/record', f, reset)}>
            <div className="row">
              <PatientSelect bind={bind} patients={list(data.patients)} />
              <select {...bind('department')}>
                <option>Ward 2</option><option>Emergency</option><option>ICU</option><option>Outpatient</option>
              </select>
            </div>
            <div className="row">
              <input placeholder="BP e.g. 120/80" size={12} maxLength={10} {...bind('bp')} />
              <input type="number" step="0.1" placeholder="Temp °C" required {...bind('temperature')} />
              <input type="number" placeholder="Pulse" required {...bind('pulse')} />
            </div>
            <input placeholder="Observations / care notes" maxLength={255} {...bind('notes')} />
            <button type="submit">Save vital signs</button>
          </form>
        </Card>

        <Card title="Shift priorities">
          <ul className="detail-list">
            <li><strong>High-risk review</strong> 3 patients require reassessment before midday</li>
            <li><strong>Medication round</strong> 8 doses due in the next 60 minutes</li>
            <li><strong>Patient education</strong> 4 discharge instructions still pending</li>
          </ul>
        </Card>
      </div>

      <div className="data-grid">
        <Card title="Recent vitals"><Table rows={vitals} empty="None recorded." cols={[['When', (v) => v.at], ['Patient', (v) => v.patient], ['BP', (v) => v.bp], ['Temp', (v) => v.temperature], ['Pulse', (v) => v.pulse], ['Notes', (v) => v.notes]]} /></Card>
        <Card title="Upcoming appointments"><Table rows={appointments} empty="None." cols={[['When', (a) => a.when_at], ['Patient', (a) => a.patient], ['Doctor', (a) => a.doctor], ['Type', (a) => a.mode], ['Status', (a) => <Tag v={a.status} />]]} /></Card>
        <Card title="Emergency cases"><Table rows={list(data.cases, []).slice(0, 5)} cols={casesCols.slice(0, 5)} empty="No active cases." /></Card>
      </div>
    </>
  );
}

export function Paramedic({ data, act }) {
  const [f, bind, reset] = useForm({ patientName: '', location: '', condition: '', priority: 'MEDIUM' });
  const cases = list(data.cases, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Active dispatch" value={String(cases.length)} trend="Live incidents" tone="danger" />
        <StatCard label="Critical" value="3" trend="At risk" tone="danger" />
        <StatCard label="Ambulance ETA" value="11 min" trend="Average" tone="warning" />
        <StatCard label="ER handoff" value="91%" trend="Completion rate" tone="success" />
      </div>

      <div className="split-layout">
        <Card title="Log emergency case">
          <form className="stack" onSubmit={submitWith(act, '/emergency/log', f, reset)}>
            <div className="row">
              <input placeholder="Patient name" required maxLength={100} {...bind('patientName')} />
              <select {...bind('priority')}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <input placeholder="Location" required maxLength={160} {...bind('location')} />
            <textarea placeholder="Condition / observations" required maxLength={255} {...bind('condition')} />
            <button type="submit" className="red">Alert ER</button>
          </form>
        </Card>

        <Card title="Treatment board">
          <ul className="detail-list">
            <li><strong>Trauma response</strong> 2 ambulance transfers in the next 45 minutes</li>
            <li><strong>Care coordination</strong> ER nurse has been notified for all critical alerts</li>
            <li><strong>On-scene status</strong> 7 field evaluations are awaiting triage review</li>
          </ul>
        </Card>
      </div>

      <Card title="My cases"><Table rows={cases} cols={casesCols.slice(0, 5)} empty="No cases logged." /></Card>
    </>
  );
}

export function Pharmacist({ data, act }) {
  const base = [['Patient', (p) => p.patient], ['Medication', (p) => p.medication], ['Dosage', (p) => p.dosage], ['Doctor', (p) => p.doctor]];
  const pending = list(data.pending, []);
  const history = list(data.history, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Pending" value={String(pending.length)} trend="Awaiting dispense" tone="warning" />
        <StatCard label="Dispensed" value={String(history.length)} trend="This week" tone="success" />
        <StatCard label="On-time rate" value="97%" trend="Fulfillment" tone="primary" />
        <StatCard label="Rx turnaround" value="12 min" trend="Median" tone="primary" />
      </div>

      <div className="data-grid">
        <Card title="Pending prescriptions"><Table rows={pending} empty="Nothing to dispense." cols={[...base, ['Instructions', (p) => p.instructions], ['', (p) => <button type="button" className="sm" onClick={() => act('/prescriptions/dispense', { id: p.id })}>Dispense</button>]]} /></Card>
        <Card title="Recently dispensed"><Table rows={history} cols={base} empty="None yet." /></Card>
      </div>
    </>
  );
}

export function Admin({ data, act }) {
  const appointments = list(data.appts, []);
  const cases = list(data.cases, []);
  const vitals = list(data.vitals, []);

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Patients served" value="12.4K" trend="This month" tone="primary" />
        <StatCard label="Occupancy" value="81%" trend="Bed utilization" tone="success" />
        <StatCard label="Virtual visits" value="1,280" trend="Completed" tone="warning" />
        <StatCard label="Revenue cycle" value="$2.1M" trend="Run-rate" tone="primary" />
      </div>

      <div className="split-layout">
        <Card title="Operational snapshot">
          <Table rows={appointments.slice(0, 6)} cols={[['Time', (a) => a.when_at], ['Patient', (a) => a.patient], ['Doctor', (a) => a.doctor], ['Status', (a) => <Tag v={a.status} />]]} empty="No scheduled visits." />
        </Card>

        <Card title="Leadership priorities">
          <ul className="detail-list">
            <li><strong>Capacity planning</strong> Expand telehealth capacity to offset clinic congestion.</li>
            <li><strong>Clinical quality</strong> Maintain a 96% follow-up completion rate across departments.</li>
            <li><strong>Growth revenue</strong> Launch subscription-based wellness and remote-monitoring packages.</li>
          </ul>
        </Card>
      </div>

      <div className="data-grid">
        <Card title="Department throughput">
          <Table rows={cases.slice(0, 5)} cols={casesCols.slice(0, 5)} empty="No incident data." />
        </Card>
        <Card title="Clinical performance">
          <Table rows={vitals.slice(0, 5)} empty="No readings." cols={[['When', (v) => v.at], ['Patient', (v) => v.patient], ['BP', (v) => v.bp], ['Pulse', (v) => v.pulse], ['Status', () => <Tag v="Stable" />]]} />
        </Card>
      </div>
    </>
  );
}
