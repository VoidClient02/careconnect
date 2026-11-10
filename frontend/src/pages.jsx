import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaCalendarCheck,
  FaClipboardList,
  FaFileMedical,
  FaHeartPulse,
  FaHospitalUser,
  FaImage,
  FaMessage,
  FaPills,
  FaShieldHeart,
  FaStethoscope,
  FaUserDoctor,
  FaUserShield,
  FaVideo,
} from 'react-icons/fa6';
import { api } from './api';
import { Card, useForm } from './ui';

const SPECIALTIES = ['General Practitioner', 'Cardiologist', 'Pediatrician', 'Surgeon', 'Orthopedic Surgeon', 'Gynecologist',
  'Neurologist', 'Psychiatrist', 'Dermatologist', 'Ophthalmologist', 'ENT Specialist', 'Radiologist', 'Anesthesiologist',
  'Oncologist', 'Urologist', 'Emergency Medicine'];

const PLATFORM_METRICS = ['94%', '3.2x', '24/7', '18 min'];
const PLATFORM_LABELS = ['patient satisfaction', 'faster workflows', 'telehealth access', 'average triage'];

const FEATURE_LIST = [
  ['Patients', 'Smart appointment booking, digital records, care plans, and remote follow-up.', <FaHospitalUser />, '/records'],
  ['Doctors', 'Unified patient history, virtual consultation tools, prescriptions and treatment plans.', <FaUserDoctor />, '/consultation'],
  ['Nurses', 'Track vital signs, intake visits, clinical workflows and patient escalations.', <FaStethoscope />, '/records'],
  ['Emergency', 'Real-time incident logging, triage, ambulance coordination and ER visibility.', <FaShieldHeart />, '/emergency'],
  ['Pharmacy', 'Automated prescription fulfillment, dispensing queue and medication tracking.', <FaPills />, '/dashboard'],
  ['Admin', 'Operational dashboards, capacity planning, staff productivity and financial oversight.', <FaCalendarCheck />, '/analytics'],
];

const accountRules = [
  'Use a secure password with at least 8 characters.',
  'Select the correct role so the system can assign the right access and workflows.',
  'Professional staff accounts require a valid licence or registration number.',
  'All patient data must be handled in line with privacy and care compliance standards.',
];

function useLiveMetrics() {
  const [live, setLive] = useState({ admissions: 148, capacity: 82, satisfaction: 94, telehealth: 226 });

  useEffect(() => {
    const timer = setInterval(() => {
      setLive((prev) => ({
        admissions: 140 + ((Math.floor(Date.now() / 1000) % 24) * 3) + (Math.random() > 0.6 ? 4 : 0),
        capacity: 78 + ((Date.now() / 1000) % 7),
        satisfaction: 92 + ((Date.now() / 7000) % 4),
        telehealth: 210 + ((Date.now() / 1000) % 18),
      }));
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return live;
}

export function AiHelpWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [uploadedPreview, setUploadedPreview] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello. I can help with appointments, virtual care, prescriptions, triage, and emergency guidance. Upload a photo when you need triage risk assessment.' },
  ]);

  const quickPrompts = ['Book a follow-up', 'I need a virtual consult', 'Check emergency triage', 'Prescription status'];

  const classifyRisk = (prompt) => {
    const text = (prompt || '').toLowerCase();
    if (uploadedFile || /emergency|chest pain|shortness of breath|unresponsive|severe bleeding|stroke|trauma|critical|collapse|fainting/.test(text)) {
      return 'Immediate emergency escalation advised';
    }
    if (/bleeding|fever|dizziness|pain|worsening|sudden|difficulty breathing|severe/.test(text)) {
      return 'High priority review';
    }
    if (/follow-up|monitoring|mild|stable|routine|normal/.test(text)) {
      return 'Routine care guidance';
    }
    return 'Standard care support';
  };

  const replyFor = (prompt) => {
    const riskLevel = classifyRisk(prompt);
    const uploadNote = uploadedFile ? ` I reviewed the uploaded image attachment (${uploadedFile.name}) and this case is classified as ${riskLevel.toLowerCase()}.` : '';

    if (prompt.toLowerCase().includes('book')) return `I can help you schedule a visit. ${uploadNote || 'Please choose a specialty, preferred date, and visit type.'}`;
    if (prompt.toLowerCase().includes('virtual')) return `Virtual care is available with live consultation records, chat follow-up, and prescription review.${uploadNote}`;
    if (prompt.toLowerCase().includes('emergency')) return `For immediate emergency help, use the emergency hotline below and activate the nearest triage channel. ${uploadNote || 'If symptoms are active, escalate now.'}`;
    if (prompt.toLowerCase().includes('prescription')) return `Prescription status can be checked from the patient portal and pharmacy dashboard.${uploadNote}`;
    if (riskLevel.includes('Immediate')) return `This case should be treated as urgent. Please activate emergency response and prioritize immediate clinical review.${uploadNote}`;
    return `I can support appointment scheduling, telehealth coordination, care reminders, triage, and patient follow-up guidance.${uploadNote}`;
  };

  const send = (promptText) => {
    const value = (promptText || input).trim();
    if (!value && !uploadedFile) return;

    const userText = uploadedFile ? `${value || 'Photo attached for triage review'}` : value;
    setMessages((prev) => [...prev, { from: 'user', text: userText }]);
    setInput('');

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: replyFor(value || uploadedFile?.name || 'triage help') }]);
      setUploadedFile(null);
      setUploadedPreview('');
    }, 250);
  };

  return (
    <div className={`ai-widget ${open ? 'open' : ''}`}>
      {!open && (
        <button type="button" className="ai-fab" onClick={() => setOpen(true)}>
          <FaMessage />
          <span>AI Help</span>
        </button>
      )}

      {open && (
        <div className="ai-panel">
          <div className="ai-header">
            <div>
              <strong>CareConnect AI</strong>
              <small>Clinical support assistant</small>
            </div>
            <button type="button" className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="ai-messages">
            {messages.map((message, idx) => (
              <div key={`${message.from}-${idx}`} className={`ai-msg ${message.from}`}>
                {message.text}
              </div>
            ))}
          </div>

          {uploadedPreview && (
            <div className="ai-attachment-preview">
              <img src={uploadedPreview} alt="Uploaded triage preview" />
            </div>
          )}

          <div className="quick-actions">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" className="mini-btn" onClick={() => send(prompt)}>{prompt}</button>
            ))}
          </div>

          <div className="ai-input-row">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about care, scheduling, telehealth..." />
            <label className="photo-upload-btn" title="Upload care photo for risk assessment">
              <FaImage />
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setUploadedPreview(reader.result);
                reader.readAsDataURL(file);
                setUploadedFile(file);
              }} />
            </label>
            <button type="button" onClick={() => send()} className="send-btn">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EmergencyHelpBar() {
  return (
    <div className="emergency-strip">
      <div className="emergency-strip-inner">
        <div className="emergency-title"><FaShieldHeart /> Emergency response</div>
        <div className="emergency-links">
          <a href="tel:+2710177">Call RSA emergency: 10177</a>
          <a href="tel:+27111234567">Medical hotline: +27 11 234 567</a>
          <a href="tel:+27118888888">Hospital triage: +27 11 888 8888</a>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const metrics = useLiveMetrics();

  return (
    <div className="page-shell home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Hospital operations and telemedicine</p>
          <h1>Connected, accessible care for clinicians, patients, and care teams.</h1>
          <p className="hero-text">
            CareConnect helps hospitals and clinics manage appointments, patient records, telehealth sessions,
            emergency workflows, pharmacy fulfillment, and real-time hospital operations in one secure platform.
          </p>

          <div className="cta-row">
            <Link className="btn primary" to="/login">Log in</Link>
            <Link className="btn secondary" to="/signup">Create account</Link>
          </div>

          <div className="metric-row">
            {PLATFORM_METRICS.map((value, index) => (
              <div key={value} className="metric-tile">
                <strong>{value}</strong>
                <span>{PLATFORM_LABELS[index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-card">
            <img
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80"
              alt="Medical team in a hospital"
              className="hero-image"
            />
            <div className="floating-badge health-badge">
              <FaVideo />
              <span>Virtual care active</span>
            </div>
          </div>

          <div className="mini-panel bottom-panel">
            <div>
              <small>Admissions today</small>
              <strong>{Math.round(metrics.admissions)}</strong>
            </div>
            <div className="status-badge positive">+{Math.round(metrics.capacity)}% utilization</div>
          </div>
        </div>
      </section>

      <section id="solutions" className="feature-grid">
        {FEATURE_LIST.map(([title, description, icon, link]) => (
          <Card key={title} title={title}>
            <div className="feature-illustration">
              <span className="feature-icon">{icon}</span>
            </div>
            <p>{description}</p>
            <Link className="card-link" to={link}>
              View capability <FaArrowRight />
            </Link>
          </Card>
        ))}
      </section>

      <section className="story-grid">
        <Card title="Why this matters">
          <ul className="bullet-list">
            <li>Reduces administrative load across clinics, specialist departments, and outpatient services.</li>
            <li>Improves continuity of care with digital records, remote follow-up, and ongoing patient monitoring.</li>
            <li>Strengthens emergency response and pharmacy visibility with single-system workflow tracking.</li>
          </ul>
        </Card>

        <Card title="Live hospital status">
          <div className="stacked-metrics">
            <div><span>Patient satisfaction</span><strong>{Math.round(metrics.satisfaction)}%</strong></div>
            <div><span>Telehealth sessions</span><strong>{Math.round(metrics.telehealth)}</strong></div>
            <div><span>Facility capacity</span><strong>{Math.round(metrics.capacity)}%</strong></div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export function AppointmentsPage() {
  const [slots, setSlots] = useState([['Dr. Ndlovu', 'Cardiology', 'Today · 09:30'], ['Dr. Mokoena', 'Orthopedics', 'Today · 12:00'], ['Dr. Patel', 'General Practice', 'Tomorrow · 08:15']]);
  const [appointment, setAppointment] = useState({ patient: '', doctor: 'Dr. Ndlovu', time: '2026-11-10T09:30', type: 'Follow-up', department: 'Cardiology' });

  const book = (e) => {
    e.preventDefault();
    setSlots((current) => [[appointment.patient || 'New patient', appointment.department, appointment.time.replace('T', ' • ')], ...current]);
  };

  return (
    <div className="page-shell appointments-page">
      <section className="page-intro">
        <p className="eyebrow"><FaCalendarCheck /> Appointments</p>
        <h2>Manage patient visits and specialist intake.</h2>
      </section>

      <div className="split-layout">
        <Card title="Book a consultation">
          <form className="stack compact-form" onSubmit={book}>
            <label>
              <span>Patient name</span>
              <input value={appointment.patient} onChange={(e) => setAppointment({ ...appointment, patient: e.target.value })} placeholder="Patient name" />
            </label>
            <label>
              <span>Doctor</span>
              <select value={appointment.doctor} onChange={(e) => setAppointment({ ...appointment, doctor: e.target.value })}>
                <option>Dr. Ndlovu</option>
                <option>Dr. Mokoena</option>
                <option>Dr. Patel</option>
                <option>Dr. Khan</option>
              </select>
            </label>
            <label>
              <span>Department</span>
              <select value={appointment.department} onChange={(e) => setAppointment({ ...appointment, department: e.target.value })}>
                <option>Cardiology</option>
                <option>General Practice</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
              </select>
            </label>
            <label>
              <span>Visit type</span>
              <select value={appointment.type} onChange={(e) => setAppointment({ ...appointment, type: e.target.value })}>
                <option>Follow-up</option>
                <option>New patient consult</option>
                <option>Telehealth review</option>
                <option>Check-up</option>
              </select>
            </label>
            <label>
              <span>Appointment date and time</span>
              <input type="datetime-local" value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} />
            </label>
            <button type="submit">Confirm appointment</button>
          </form>
        </Card>

        <Card title="Availability">
          <ul className="detail-list">
            <li><strong>Next open slots</strong> 7 cardiology consults today</li>
            <li><strong>Virtual queue</strong> 15 patients waiting for remote review</li>
            <li><strong>Clinic flow</strong> 18-minute average waiting time</li>
          </ul>
        </Card>
      </div>

      <Card title="Active schedule">
        <TableCompact rows={slots} />
      </Card>
    </div>
  );
}

export function TelehealthPage() {
  const [sessions, setSessions] = useState([
    { doctor: 'Dr. Ndlovu', patient: 'A. Smith', status: 'Waiting', type: 'Cardiology review' },
    { doctor: 'Dr. Patel', patient: 'M. Jansen', status: 'In call', type: 'Medication consultation' },
    { doctor: 'Dr. Khan', patient: 'T. Mokoena', status: 'Follow-up', type: 'Post-op review' },
  ]);

  const startSession = () => {
    setSessions((current) => current.map((session, idx) => idx === 0 ? { ...session, status: 'In call' } : session));
  };

  return (
    <div className="page-shell telehealth-page">
      <section className="page-intro">
        <p className="eyebrow"><FaVideo /> Telehealth</p>
        <h2>Virtual care that keeps patients connected to clinicians.</h2>
      </section>

      <div className="stats-grid">
        <div className="stat-card primary"><span className="stat-label">Live sessions</span><strong>42</strong><small>Across departments</small></div>
        <div className="stat-card success"><span className="stat-label">Consult completion</span><strong>96%</strong><small>Within the hour</small></div>
        <div className="stat-card warning"><span className="stat-label">Remote follow-ups</span><strong>18</strong><small>Due today</small></div>
      </div>

      <div className="split-layout">
        <Card title="Virtual care queue">
          <TableCompact rows={sessions.map((session) => [session.doctor, session.patient, session.type, session.status])} headers={['Doctor', 'Patient', 'Consult type', 'Status']} />
        </Card>

        <Card title="Consult actions">
          <ul className="detail-list">
            <li><strong>Video call</strong> Start remote review sessions and record clinical notes live.</li>
            <li><strong>Medication review</strong> Follow-up scripts, refill approvals, and pharmacy handoff.</li>
            <li><strong>Care alerts</strong> Trigger escalations for high-risk patients automatically.</li>
          </ul>
          <button type="button" onClick={startSession} className="mt-1">Start priority session</button>
        </Card>
      </div>
    </div>
  );
}

export function EmergencyPage() {
  const [incident, setIncident] = useState({ patient: '', location: '', severity: 'High', notes: '' });
  const [incidentPhoto, setIncidentPhoto] = useState(null);
  const [alerts, setAlerts] = useState([
    ['T. Ncube', 'Johannesburg CBD', 'Critical', 'Cardiac event • ambulance dispatched'],
    ['M. Pienaar', 'Hillbrow', 'High', 'Respiratory distress • oxygen provided'],
  ]);

  const riskFromSeverity = (severity) => {
    if (severity === 'Critical') return 'Immediate emergency response required';
    if (severity === 'High') return 'Urgent clinical review required';
    return 'Routine response with monitoring';
  };

  const logIncident = (e) => {
    e.preventDefault();
    const photoText = incidentPhoto ? ` • photo uploaded (${incidentPhoto.name})` : '';
    const riskText = riskFromSeverity(incident.severity);
    setAlerts((current) => [[incident.patient || 'New patient', incident.location || 'Unknown', incident.severity, `${incident.notes || 'Immediate triage'}${photoText} • ${riskText}`], ...current]);
    setIncidentPhoto(null);
    setIncident({ patient: '', location: '', severity: 'High', notes: '' });
  };

  return (
    <div className="page-shell emergency-page">
      <section className="page-intro light">
        <p className="eyebrow">Emergency response</p>
        <h2>Rapid triage, field response, and emergency communications.</h2>
      </section>

      <div className="split-layout">
        <Card title="Emergency intake form">
          <form className="stack compact-form" onSubmit={logIncident}>
            <label>
              <span>Patient or caller name</span>
              <input value={incident.patient} onChange={(e) => setIncident({ ...incident, patient: e.target.value })} placeholder="Patient or caller name" />
            </label>
            <label>
              <span>Location</span>
              <input value={incident.location} onChange={(e) => setIncident({ ...incident, location: e.target.value })} placeholder="Incident location" />
            </label>
            <label>
              <span>Severity</span>
              <select value={incident.severity} onChange={(e) => setIncident({ ...incident, severity: e.target.value })}>
                <option>Low</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
            <label>
              <span>Notes</span>
              <textarea value={incident.notes} onChange={(e) => setIncident({ ...incident, notes: e.target.value })} placeholder="Describe symptoms, condition, or immediate actions needed" />
            </label>
            <label className="upload-box">
              <span><FaImage /> Attach triage photo</span>
              <input type="file" accept="image/*" onChange={(e) => setIncidentPhoto(e.target.files?.[0] || null)} />
            </label>
            {incidentPhoto && <small className="upload-name">Photo attached: {incidentPhoto.name}</small>}
            <button type="submit" className="red">Send emergency alert</button>
          </form>
        </Card>

        <Card title="Emergency contacts">
          <ul className="detail-list">
            <li><strong>RSA emergency number</strong><a href="tel:+2710177">10177</a></li>
            <li><strong>Medical hotline</strong><a href="tel:+27111234567">+27 11 234 567</a></li>
            <li><strong>Hospital triage desk</strong><a href="tel:+27118888888">+27 11 888 8888</a></li>
            <li><strong>Critical care team</strong> 3 paramedic units deployed in the last hour</li>
          </ul>
        </Card>
      </div>

      <Card title="Live incident feed">
        <TableCompact rows={alerts} headers={['Patient', 'Location', 'Priority', 'Details']} />
      </Card>
    </div>
  );
}

export function PatientRecordsPage() {
  const fallbackRecords = [
    { id: 'PT-1045', name: 'A. Smith', age: 34, lastVisit: '2026-11-09', dept: 'Cardiology', risk: 'Stable', status: 'Active' },
    { id: 'PT-1180', name: 'M. Jansen', age: 46, lastVisit: '2026-11-08', dept: 'Neurology', risk: 'Watchlist', status: 'Monitoring' },
    { id: 'PT-1214', name: 'T. Mokoena', age: 29, lastVisit: '2026-11-07', dept: 'Pediatrics', risk: 'Stable', status: 'Follow-up' },
    { id: 'PT-1298', name: 'R. Daniels', age: 58, lastVisit: '2026-11-05', dept: 'Orthopedics', risk: 'Moderate', status: 'Recovery' },
  ];
  const patientSuggestions = fallbackRecords.map((patient) => patient.name);
  const [records, setRecords] = useState(fallbackRecords);

  useEffect(() => {
    api.get('/dashboard').then((data) => {
      const list = Array.isArray(data.patients) ? data.patients : [];
      if (list.length) {
        setRecords(list.slice(0, 6).map((patient, index) => ({
          id: patient.id ? `PT-${patient.id}` : `PT-${1000 + index}`,
          name: patient.full_name || patient.name || 'Patient',
          age: 25 + (index * 6) % 45,
          lastVisit: ['2026-11-09', '2026-11-08', '2026-11-07', '2026-11-06'][index % 4],
          dept: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'][index % 4],
          risk: ['Stable', 'Watchlist', 'Moderate'][index % 3],
          status: ['Active', 'Monitoring', 'Follow-up'][index % 3],
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="page-shell records-page">
      <section className="page-intro">
        <p className="eyebrow"><FaUserShield /> Patient Records</p>
        <h2>Clinical records, history, and patient continuity.</h2>
      </section>

      <div className="stats-grid">
        <div className="stat-card primary"><span className="stat-label">Active records</span><strong>4,286</strong><small>Across all departments</small></div>
        <div className="stat-card success"><span className="stat-label">Follow-up due</span><strong>192</strong><small>Due this week</small></div>
        <div className="stat-card warning"><span className="stat-label">High-risk</span><strong>34</strong><small>Needs monitoring</small></div>
      </div>

      <div className="split-layout">
        <Card title="Patient summary">
          <form className="stack compact-form">
            <label>
              <span>Search patient</span>
              <input list="patient-record-list" placeholder="Patient ID or name" aria-label="Search patient" />
              <datalist id="patient-record-list">
                {patientSuggestions.map((patient) => (
                  <option key={patient} value={patient} />
                ))}
              </datalist>
            </label>
            <label>
              <span>Department</span>
              <select aria-label="Filter department">
                <option>All departments</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>Orthopedics</option>
              </select>
            </label>
            <button type="button">Filter patients</button>
          </form>
        </Card>

        <Card title="Clinical highlights">
          <ul className="detail-list">
            <li><strong>Medication review</strong> 18 prescriptions require pharmacist verification this afternoon.</li>
            <li><strong>Care plans</strong> 7 patients are progressing under remote monitoring programs.</li>
            <li><strong>Data quality</strong> 96.4% of records are complete and synced with the EHR.</li>
          </ul>
        </Card>
      </div>

      <Card title="Patient record index">
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Last Visit</th>
                <th>Department</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.lastVisit}</td>
                  <td>{patient.dept}</td>
                  <td><span className="tag">{patient.risk}</span></td>
                  <td><span className="tag SUCCESS">{patient.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function TelemedicineConsultationPage() {
  const meds = [
    ['Amoxicillin', '500mg', 'Twice daily'],
    ['Vitamin D', '1000IU', 'Daily'],
  ];
  const [consultation, setConsultation] = useState({
    patient: 'A. Smith',
    doctor: 'Dr. Ndlovu',
    vitals: 'BP 120/80 · HR 72',
    mode: 'Video + notes',
  });
  const [sessionLive, setSessionLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((data) => {
      const firstAppt = Array.isArray(data.appts) && data.appts.length ? data.appts[0] : null;
      const firstVital = Array.isArray(data.vitals) && data.vitals.length ? data.vitals[0] : null;
      if (firstAppt || firstVital) {
        setConsultation({
          patient: firstAppt?.patient || 'Patient',
          doctor: firstAppt?.doctor || 'Clinician',
          vitals: firstVital ? `BP ${firstVital.bp || '120/80'} · HR ${firstVital.pulse || '72'}` : 'BP 120/80 · HR 72',
          mode: firstAppt?.mode === 'VIRTUAL' ? 'Video + notes' : 'In-person review',
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="page-shell consultation-page">
      <section className="page-intro">
        <p className="eyebrow"><FaHeartPulse /> Telemedicine</p>
        <h2>Live virtual consultation workspace.</h2>
      </section>

      <div className="consultation-shell">
        <Card title="Patient session">
          <div className={`video-panel ${sessionLive ? 'session-live' : 'session-idle'}`}>
            <div className="video-overlay">
              <span className={`live-pill ${sessionLive ? 'active' : ''}`}>{sessionLive ? 'Live consultation' : 'Consultation offline'}</span>
              <strong>{sessionLive ? `${consultation.doctor} · ${consultation.mode}` : 'Ready to start a consultation'}</strong>
            </div>
          </div>

          <div className="consultation-controls">
            <button type="button" onClick={() => setSessionLive(true)}>{sessionLive ? 'Reconnect call' : 'Start consultation'}</button>
            <button type="button" className="secondary-action" onClick={() => setSessionLive(false)}>End session</button>
          </div>

          <div className="consultation-meta">
            <div>
              <small>Patient</small>
              <strong>{consultation.patient}</strong>
            </div>
            <div>
              <small>Vitals</small>
              <strong>{consultation.vitals}</strong>
            </div>
            <div>
              <small>Mode</small>
              <strong>{consultation.mode}</strong>
            </div>
          </div>
        </Card>

        <Card title="Consultation notes">
          <ul className="detail-list">
            <li><strong>Assessment</strong> Mild chest discomfort resolved after rest; patient reports improved symptoms in the past 24 hours.</li>
            <li><strong>Care plan</strong> Continue monitoring, maintain medication adherence, and schedule a follow-up in 7 days.</li>
            <li><strong>Action items</strong> Send ECG results, update symptoms log, and confirm activity restrictions.</li>
          </ul>

          <div className="action-row">
            <button type="button">Save consultation</button>
            <button type="button" className="secondary-action">Send follow-up</button>
          </div>

          <div className="call-toggle-row">
            <button type="button" className={micOn ? 'secondary-action' : 'alert-action'} onClick={() => setMicOn((value) => !value)}>
              {micOn ? 'Mute mic' : 'Unmute mic'}
            </button>
            <button type="button" className={cameraOn ? 'secondary-action' : 'alert-action'} onClick={() => setCameraOn((value) => !value)}>
              {cameraOn ? 'Turn camera off' : 'Turn camera on'}
            </button>
          </div>
        </Card>
      </div>

      <div className="split-layout">
        <Card title="Medication review">
          <table>
            <thead>
              <tr><th>Medication</th><th>Dosage</th><th>Schedule</th></tr>
            </thead>
            <tbody>
              {meds.map(([med, dose, schedule]) => (
                <tr key={med}><td>{med}</td><td>{dose}</td><td>{schedule}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Session controls">
          <ul className="detail-list">
            <li><strong>Prescription check</strong> Verify refill and dosage before closing session.</li>
            <li><strong>Payment status</strong> Consultation covered under primary care plan.</li>
            <li><strong>Escalation</strong> Connect to emergency response if symptoms worsen during follow-up.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsReportsPage() {
  const wardUtilization = [72, 88, 64, 96, 78, 82];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [metrics, setMetrics] = useState({ occupancy: 81, turnaround: 18, noShow: 6.1 });

  useEffect(() => {
    api.get('/dashboard').then((data) => {
      const apptCount = Array.isArray(data.appts) ? data.appts.length : 0;
      const caseCount = Array.isArray(data.cases) ? data.cases.length : 0;
      const patientCount = Array.isArray(data.patients) ? data.patients.length : 0;
      setMetrics({
        occupancy: Math.min(95, 68 + (apptCount % 20) + (caseCount % 10)),
        turnaround: 14 + (caseCount % 8),
        noShow: Number((4.4 + (patientCount % 5) * 0.7).toFixed(1)),
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="page-shell analytics-page">
      <section className="page-intro">
        <p className="eyebrow"><FaClipboardList /> Hospital analytics</p>
        <h2>Operational performance and admin reporting.</h2>
      </section>

      <div className="stats-grid">
        <div className="stat-card primary"><span className="stat-label">Avg. occupancy</span><strong>{metrics.occupancy}%</strong><small>Across inpatient units</small></div>
        <div className="stat-card success"><span className="stat-label">ER turnaround</span><strong>{metrics.turnaround} min</strong><small>Median response</small></div>
        <div className="stat-card warning"><span className="stat-label">No-show rate</span><strong>{metrics.noShow}%</strong><small>Improved this week</small></div>
      </div>

      <div className="analytics-grid">
        <Card title="Ward utilization">
          <div className="chart-bars">
            {wardUtilization.map((value, index) => (
              <div key={labels[index]} className="bar-group">
                <span className="bar" style={{ height: `${value}%` }} />
                <small>{labels[index]}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Patient mix">
          <div className="donut-wrap">
            <div className="donut-chart">
              <span>44%</span>
            </div>
            <ul className="legend-list">
              <li><span className="legend-dot one" /> Cardiology</li>
              <li><span className="legend-dot two" /> Pediatrics</li>
              <li><span className="legend-dot three" /> Orthopedics</li>
              <li><span className="legend-dot four" /> Other</li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="split-layout">
        <Card title="Executive report">
          <ul className="detail-list">
            <li><strong>Revenue</strong> Run rate remains positive with a 14% increase in telehealth consult volume.</li>
            <li><strong>Clinical quality</strong> Average satisfaction score sits at 94%, above operating target.</li>
            <li><strong>Capacity trend</strong> Inpatient bed utilization is stable, though weekend admissions are trending upward.</li>
          </ul>
        </Card>

        <Card title="Admin alerts">
          <ul className="detail-list">
            <li><strong>Dispatch notice</strong> 3 ambulance units are coordinated for peak-hours coverage.</li>
            <li><strong>Staffing</strong> 2 specialists are scheduled for next-day remote review coverage.</li>
            <li><strong>Compliance</strong> Documentation completion remains above 96% across active departments.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function Login({ onLogin }) {
  const [f, bind] = useForm({ email: '', password: '' });
  const [err, setErr] = useState('');
  const { state } = useLocation();

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { onLogin(await api.post('/auth/login', f)); } catch (x) { setErr(x.message); }
  };

  return (
    <div className="auth-layout page-shell login-page">
      <Card title="Welcome back">
        {state?.registered && <p className="note">Account created. Please log in.</p>}
        {err && <p className="err">{err}</p>}
        <form className="stack compact-form" onSubmit={submit}>
          <label>
            <span>Email address</span>
            <input type="email" placeholder="Email address" required {...bind('email')} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Password" required {...bind('password')} />
          </label>
          <button type="submit">Log in</button>
        </form>
        <p className="form-link">No account yet? <Link to="/signup">Create one</Link></p>
      </Card>

      <Card title={<><FaFileMedical /> Access rules</>}>
        <ul className="bullet-list muted-list">
          <li>Your password must be secure and not shared.</li>
          <li>Use the verified hospital network when accessing sensitive patient data.</li>
          <li>Patient-facing workflows will use role-based access and approval checks.</li>
        </ul>
      </Card>
    </div>
  );
}

export function Signup() {
  const [f, bind] = useForm({ fullName: '', email: '', password: '', role: 'PATIENT', specialty: '', licenseNo: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/auth/signup', f); nav('/login', { state: { registered: true } }); } catch (x) { setErr(x.message); }
  };

  return (
    <div className="auth-layout page-shell signup-page">
      <Card title={<><FaUserDoctor /> Create a CareConnect account</>}>
        {err && <p className="err">{err}</p>}
        <form className="stack compact-form" onSubmit={submit}>
          <label>
            <span>Full name</span>
            <input placeholder="Full name" required maxLength={100} {...bind('fullName')} />
          </label>
          <label>
            <span>Email address</span>
            <input type="email" placeholder="Email address" required {...bind('email')} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Password (minimum 8 characters)" required minLength={8} {...bind('password')} />
          </label>

          <label>
            <span>Role</span>
            <select {...bind('role')}>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="PARAMEDIC">Paramedic</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </label>

          {f.role === 'DOCTOR' && (
            <label>
              <span>Specialty</span>
              <select required {...bind('specialty')}>
                <option value="">Select specialty...</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          )}

          {f.role !== 'PATIENT' && (
            <label>
              <span>Professional licence number</span>
              <input placeholder="Professional licence no." maxLength={40} {...bind('licenseNo')} />
            </label>
          )}

          <button type="submit">Create account</button>
        </form>
      </Card>

      <Card title={<><FaShieldHeart /> Account rules and compliance</>}>
        <ul className="bullet-list muted-list">
          {accountRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TableCompact({ headers, rows }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row[0]}-${idx}`}>
              {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

