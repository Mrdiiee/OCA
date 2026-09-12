'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const LEVELS = [
  { min: 0, max: 24, name: 'FOUNDATION', desc: 'Tahap awal. Fokus pada kesiapan dasar dan pengenalan standar Oxygen.' },
  { min: 25, max: 49, name: 'TRAIL READY', desc: 'Sudah memenuhi dasar kesiapan untuk aktivitas outdoor bersama tim.' },
  { min: 50, max: 74, name: 'FIELD READY', desc: 'Memiliki pengalaman dan kesiapan yang dinilai baik di lapangan.' },
  { min: 75, max: 89, name: 'ADVANCED', desc: 'Kualifikasi tinggi dengan pengalaman dan konsistensi yang kuat.' },
  { min: 90, max: 100, name: 'OXYGEN CORE', desc: 'Kualifikasi tertinggi berdasarkan penilaian tim Oxygen.' },
];
function getLevel(score) { return LEVELS.find((level) => score >= level.min && score <= level.max) || LEVELS[0]; }

export default function OxygenIndexPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null); const [assessment, setAssessment] = useState(null); const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getUser(); const currentUser = data?.user;
      if (!active) return;
      if (!currentUser) { window.location.replace('/login?next=/oxygen-index'); return; }
      setUser(currentUser);
      const response = await fetch('/api/oxygen-index', { cache: 'no-store' });
      if (response.ok) { const oxygenData = await response.json(); if (active) { setAssessment(oxygenData.current || null); setHistory(oxygenData.history || []); } }
      setLoading(false);
    }
    load(); return () => { active = false; };
  }, [supabase]);
  if (loading) return <main className="page"><p>Memuat Oxygen Index...</p></main>;

  const score = Number.isFinite(Number(assessment?.total_score)) ? Number(assessment.total_score) : 0; const level = getLevel(score);
  const criteria = assessment ? [['01', 'Pengalaman outdoor', assessment.experience_score, 25], ['02', 'Kesiapan & keselamatan', assessment.safety_score, 25], ['03', 'Skill lapangan', assessment.field_skill_score, 20], ['04', 'Disiplin & tanggung jawab', assessment.discipline_score, 15], ['05', 'Kontribusi ke tim Oxygen', assessment.contribution_score, 15]] : [];

  return <main className="page"><header className="topbar"><a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a><a href="/informasi-user" className="back">Informasi Akun</a></header><section className="content"><p className="eyebrow">MEMBER / OXYGEN INDEX</p><h1>OXYGEN<br /><em>INDEX.</em></h1><p className="intro">Skor kualifikasi personal yang digunakan tim Oxygen untuk melihat kesiapan, pengalaman, disiplin, dan kontribusi kamu dalam aktivitas outdoor.</p>
    <section className="score-card"><div><div className="label">CURRENT INDEX</div><div className="score">{score}<span>/100</span></div></div><div className="level"><span>LEVEL</span><strong>{level.name}</strong><p>{level.desc}</p>{assessment?.created_at && <small>Evaluasi terakhir: {new Date(assessment.created_at).toLocaleString('id-ID')}</small>}</div></section>
    <section className="card"><div className="label">BREAKDOWN PENILAIAN</div>{criteria.length ? criteria.map(([number, name, value, max]) => <div className="criteria" key={name}><span>{number}</span><div><strong>{name}</strong><b>{value}/{max}</b><p>{name === 'Pengalaman outdoor' ? 'Jam terbang dan pengalaman menghadapi variasi medan.' : name === 'Kesiapan & keselamatan' ? 'Kesiapan fisik, perlengkapan, dan kepatuhan standar keselamatan.' : name === 'Skill lapangan' ? 'Kemampuan teknis, membaca medan, dan mengambil keputusan.' : name === 'Disiplin & tanggung jawab' ? 'Konsistensi, komunikasi, ketepatan waktu, dan tanggung jawab tim.' : 'Partisipasi, kepemimpinan, dan kontribusi positif dalam komunitas.'}</p></div></div>) : <div className="empty">Belum ada evaluasi dari tim Oxygen. Index kamu akan muncul setelah penilaian pertama.</div>}</section>
    {assessment?.notes && <div className="note"><strong>Catatan tim Oxygen.</strong> {assessment.notes}</div>}
    <section className="card history"><div className="label">RIWAYAT EVALUASI</div>{history.length ? history.map((item) => <div className="history-row" key={item.id}><span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span><strong>{item.total_score}/100</strong><b>{item.level}</b></div>) : <div className="empty">Belum ada riwayat evaluasi.</div>}</section>
    <div className="actions"><a className="btn primary" href="/informasi-user">KEMBALI KE INFORMASI AKUN</a><a className="btn" href="/">BERANDA</a></div>
  </section><style jsx>{`:global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#0b0b0a;color:#f7f6f3;font-family:Arial,Helvetica,sans-serif}.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px clamp(16px,5vw,60px);border-bottom:1px solid #302e29;position:sticky;top:0;background:rgba(11,11,10,.96);backdrop-filter:blur(12px);z-index:5}.brand{color:#f7f6f3;text-decoration:none;font-weight:800;letter-spacing:.05em}.mark{display:inline-block;width:13px;height:13px;background:#e1261c;margin-right:9px}.back{color:#aaa69d;text-decoration:none;font-size:13px}.back:hover{color:#e1261c}.content{max-width:1050px;margin:0 auto;padding:80px 20px 100px}.eyebrow{font:11px monospace;color:#8b887f;letter-spacing:.08em;margin:0 0 18px}h1{font-size:clamp(54px,9vw,100px);line-height:.88;letter-spacing:-.04em;margin:0 0 25px}h1 em{font-style:normal;color:#e1261c}.intro{max-width:700px;color:#d8d5cd;line-height:1.65;margin-bottom:35px}.score-card{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}.score-card,.card{border:1px solid #302e29;background:#11110f;padding:26px}.label{font:10px monospace;color:#8b887f;letter-spacing:.08em;margin-bottom:12px}.score{font-size:clamp(72px,12vw,130px);font-weight:900;letter-spacing:-.08em;line-height:.9}.score span{font-size:18px;color:#77736c;letter-spacing:0;margin-left:8px}.level{border-left:1px solid #302e29;padding-left:25px;display:flex;flex-direction:column;justify-content:center}.level span{font:10px monospace;color:#e1261c;letter-spacing:.12em}.level strong{font-size:27px;margin:8px 0}.level p{color:#8b887f;font-size:13px;line-height:1.55;margin:0}.level small{color:#66635d;font-size:10px;margin-top:10px}.criteria{display:grid;grid-template-columns:42px 1fr;gap:15px;padding:19px 0;border-bottom:1px solid #25231f}.criteria:last-child{border-bottom:0}.criteria>span{font:11px monospace;color:#e1261c}.criteria strong{font-size:14px}.criteria b{float:right;font-size:12px;color:#f7f6f3}.criteria p{color:#8b887f;font-size:13px;line-height:1.55;margin:6px 0 0}.empty{color:#77736c;font-size:13px;line-height:1.6;padding:8px 0}.note{margin-top:18px;padding:17px 18px;border:1px solid #302e29;background:#151412;color:#8b887f;font-size:12px;line-height:1.6}.note strong{color:#f7f6f3}.history{margin-top:18px}.history-row{display:grid;grid-template-columns:1fr auto auto;gap:20px;padding:13px 0;border-top:1px solid #25231f;align-items:center;font-size:12px}.history-row span{color:#77736c}.history-row b{font-size:10px;letter-spacing:.08em;color:#e1261c}.actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}.btn{border:1px solid #302e29;background:transparent;color:#f7f6f3;padding:12px 16px;cursor:pointer;font-weight:700;text-decoration:none}.btn:hover{border-color:#e1261c;color:#e1261c}.btn.primary{border-color:#f7f6f3;background:#f7f6f3;color:#0b0b0a}@media(max-width:700px){.score-card{grid-template-columns:1fr}.level{border-left:0;border-top:1px solid #302e29;padding:20px 0 0}.content{padding-top:55px}.score{font-size:90px}.criteria b{float:none;display:block;margin-top:6px}.history-row{grid-template-columns:1fr auto}.history-row b{grid-column:2}.history-row strong{grid-column:2;grid-row:1}}`}</style></main>;
}
