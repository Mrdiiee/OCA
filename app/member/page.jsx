'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

const principles = [
  ['01', 'JOURNEY', 'Setiap perjalanan menjadi bagian dari cerita dan pengalamanmu bersama Oxygen Gear.'],
  ['02', 'COMMUNITY', 'Bertemu, berjalan, belajar, dan tumbuh bersama orang-orang yang punya semangat yang sama.'],
  ['03', 'RESPONSIBILITY', 'Keselamatan, kesiapan, dan rasa hormat terhadap alam selalu menjadi bagian dari perjalanan.'],
];

export default function MemberPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        window.location.replace('/login?next=/member');
        return;
      }
      if (!active) return;
      setUser(currentUser);
      const { data } = await supabase.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle();
      if (!active) return;
      setProfile(data || null);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [supabase]);

  async function verifyCode(event) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setMember(null);
    setCodeError('');
    if (!normalized) {
      setCodeError('Masukkan kode member terlebih dahulu.');
      return;
    }
    setCheckingCode(true);
    try {
      const response = await fetch('/api/member/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Kode tidak valid.');
      setMember(data.member);
    } catch (error) {
      setCodeError(error.message || 'Kode member belum dapat diperiksa.');
    } finally {
      setCheckingCode(false);
    }
  }

  if (loading) return <main className="page"><div className="loading">MEMUAT MEMBER AREA...</div></main>;

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Member';

  return (
    <main className="page">
      <header className="topbar">
        <a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a>
        <div className="top-links"><a href="/informasi-user">INFORMASI AKUN</a><a href="/event">EVENT</a></div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">OXYGEN GEAR / MEMBER</p>
          <div className="hero-copy">
            <div>
              <h1>MORE THAN<br /><em>A NAME.</em></h1>
              <p className="lead">Oxygen Member adalah identitas perjalananmu di dalam ekosistem Oxygen Gear — bukan sekadar akun, tetapi rekam pengalaman, kontribusi, dan perkembanganmu.</p>
            </div>
            <div className="member-badge"><span>MEMBER</span><strong>{name.toUpperCase()}</strong><small>{user?.email_confirmed_at ? 'EMAIL TERVERIFIKASI' : 'EMAIL BELUM TERVERIFIKASI'}</small></div>
          </div>
        </div>
      </section>

      <section className="journey-intro">
        <div className="section-label"><span>01 / THE OXYGEN MEMBER</span><span>ACCOUNT ≠ MEMBER</span></div>
        <div className="journey-grid">
          <h2>YOUR<br /><em>JOURNEY.</em></h2>
          <div className="journey-text"><p>Akun adalah tempat kamu mengelola identitas dan transaksi. Member adalah tempat perjalananmu bersama Oxygen Gear mulai tercatat.</p><p>Ikuti event, bangun pengalaman, berkontribusi di komunitas, dan kembangkan kualifikasimu.</p></div>
        </div>
        <div className="ecosystem">
          <div><span>01</span><strong>ACCOUNT</strong><small>Identitas & transaksi</small></div>
          <div className="active"><span>02</span><strong>MEMBER</strong><small>Komunitas & perjalanan</small></div>
          <div><span>03</span><strong>OXYGEN INDEX</strong><small>Kualifikasi & perkembangan</small></div>
        </div>
      </section>

      <section className="index-section">
        <div className="index-inner">
          <div>
            <p className="eyebrow red">02 / OXYGEN INDEX</p>
            <h2>MEASURE<br /><em>YOUR GROWTH.</em></h2>
            <p className="index-copy">Oxygen Index menggambarkan kualifikasi seorang member berdasarkan pengalaman outdoor, kesiapan keselamatan, kemampuan di lapangan, tanggung jawab, dan kontribusi komunitas.</p>
            <a href="/oxygen-index" className="text-link">PELAJARI OXYGEN INDEX →</a>
          </div>
          <div className="score-card"><span>CURRENT INDEX</span><strong>—</strong><b>BUILD YOUR JOURNEY</b><p>Ikuti perjalanan dan evaluasi untuk mulai membangun Oxygen Index-mu.</p></div>
        </div>
      </section>

      <section className="journey-section">
        <div className="section-label"><span>03 / YOUR JOURNEY</span><span>EVENT · EXPERIENCE · CONTRIBUTION</span></div>
        <h2>EVERY JOURNEY<br /><em>COUNTS.</em></h2>
        <div className="journey-cards">
          <a href="/event"><span>01</span><strong>EVENTS</strong><p>Temukan pendakian bersama, ekspedisi, dan private trip.</p><b>LIHAT EVENT →</b></a>
          <div><span>02</span><strong>EXPERIENCE</strong><p>Pengalaman yang kamu jalani menjadi bagian dari perjalanan member.</p><b>COMING AS YOUR JOURNEY GROWS</b></div>
          <div><span>03</span><strong>ACHIEVEMENT</strong><p>Pencapaian dan milestone akan menjadi bagian dari identitasmu.</p><b>COMING AS YOUR JOURNEY GROWS</b></div>
        </div>
      </section>

      <section className="principles">
        <div className="section-label"><span>04 / PRINCIPLES</span><span>THE OXYGEN WAY</span></div>
        <div className="principle-grid">{principles.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="benefits">
        <div className="benefits-inner">
          <p className="eyebrow">05 / MEMBER BENEFITS</p>
          <h2>THE MORE YOU<br /><em>JOURNEY.</em></h2>
          <div className="benefit-list"><span>EARLY ACCESS TO EVENTS</span><span>MEMBER PRIVILEGES</span><span>EXCLUSIVE EXPERIENCES</span><span>COMMUNITY ACCESS</span></div>
          <p className="benefit-note">Benefit akan berkembang mengikuti ekosistem Oxygen Gear. Untuk sekarang, mulai dari satu langkah: ikut perjalanan berikutnya.</p>
          <a href="/event" className="cta">FIND YOUR NEXT JOURNEY →</a>
        </div>
      </section>

      <section className="code-section">
        <div>
          <p className="eyebrow red">06 / MEMBER VERIFICATION</p>
          <h2>ALREADY HAVE<br /><em>A MEMBER CODE?</em></h2>
          <p>Masukkan kode member yang kamu dapatkan setelah mengikuti event Oxygen Gear untuk melihat status dan benefit yang terdaftar.</p>
        </div>
        <div>
          <form onSubmit={verifyCode} className="code-form"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="OCA-2026-001" aria-label="Kode member" autoComplete="off" /><button type="submit" disabled={checkingCode}>{checkingCode ? 'MEMERIKSA...' : 'CEK KODE'}</button></form>
          {codeError && <div className="code-error" role="alert">{codeError}</div>}
          {member && <article className="member-result"><div><span>MEMBER TERDAFTAR</span><h3>{member.name}</h3><p>{member.event}</p></div><strong>{member.status}</strong><div className="benefit-result"><span>{member.date || '-'}</span><ul>{member.benefits.map((item) => <li key={item}>{item}</li>)}</ul></div></article>}
        </div>
      </section>

      <footer className="footer"><a href="/" className="brand"><span className="mark" />OXYGEN GEAR</a><span>MEMBER / THE JOURNEY CONTINUES.</span><a href="/informasi-user">INFORMASI AKUN →</a></footer>

      <style jsx>{`
        :global(*){box-sizing:border-box}:global(body){margin:0;background:#0b0b0a}.page{min-height:100vh;background:#f7f6f3;color:#111;font-family:Arial,Helvetica,sans-serif}.topbar{display:flex;align-items:center;justify-content:space-between;padding:19px clamp(16px,5vw,60px);background:#111;color:#fff;position:sticky;top:0;z-index:10;border-bottom:1px solid #302e29}.brand{color:inherit;text-decoration:none;font-size:13px;font-weight:900;letter-spacing:.06em}.mark{display:inline-block;width:12px;height:12px;background:#e1261c;margin-right:8px}.top-links{display:flex;gap:28px}.top-links a{color:#aaa;text-decoration:none;font:10px monospace;letter-spacing:.1em}.top-links a:hover{color:#fff}.hero{background:#111;color:#f7f6f3}.hero-inner,.journey-intro,.journey-section,.principles,.code-section{width:min(1160px,calc(100% - 40px));margin:0 auto}.hero-inner{padding:clamp(65px,9vw,115px) 0 95px}.eyebrow{font:10px monospace;letter-spacing:.14em;color:#858179;margin:0 0 18px}.eyebrow.red{color:#e1261c}.hero-copy{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:60px;align-items:end}.hero h1{font-size:clamp(62px,10vw,132px);line-height:.82;letter-spacing:-.07em;margin:0}.hero h1 em,h2 em{font-style:normal;color:#e1261c}.lead{max-width:650px;color:#aaa79f;font-size:15px;line-height:1.8;margin:32px 0 0}.member-badge{border:1px solid #3b3934;padding:24px;background:#151512;display:grid;gap:9px}.member-badge span{font:10px monospace;color:#e1261c;letter-spacing:.12em}.member-badge strong{font-size:23px;line-height:1;overflow-wrap:anywhere}.member-badge small{font:9px monospace;color:#77736b}.journey-intro{padding:78px 0 105px}.section-label{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #d8d6d0;padding-bottom:13px;color:#858179;font:10px monospace;letter-spacing:.11em}.journey-grid{display:grid;grid-template-columns:1fr 1fr;gap:70px;padding:48px 0}.journey-grid h2,.journey-section>h2,.benefits h2,.code-section h2{font-size:clamp(45px,6vw,78px);line-height:.88;letter-spacing:-.06em;margin:0}.journey-text{max-width:560px;padding-top:5px}.journey-text p{font-size:15px;line-height:1.8;color:#666;margin:0 0 18px}.ecosystem{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #d8d6d0;background:#d8d6d0;gap:1px}.ecosystem div{background:#fff;padding:25px;min-height:145px;display:flex;flex-direction:column}.ecosystem span,.principle-grid article>span{font:10px monospace;color:#999}.ecosystem strong{font-size:19px;margin-top:auto}.ecosystem small{font-size:11px;color:#777;margin-top:7px}.ecosystem .active{background:#111;color:#fff}.ecosystem .active span{color:#e1261c}.ecosystem .active small{color:#999}.index-section{background:#e1261c;color:#fff}.index-inner{width:min(1160px,calc(100% - 40px));margin:auto;padding:78px 0 88px;display:grid;grid-template-columns:1fr 360px;gap:70px;align-items:center}.index-inner h2{font-size:clamp(45px,6vw,78px);line-height:.88;letter-spacing:-.06em;margin:0}.index-inner h2 em{color:#111}.index-copy{max-width:620px;font-size:14px;line-height:1.8;color:#ffd9d6;margin:28px 0}.text-link{color:#fff;text-decoration:none;font:10px monospace;letter-spacing:.1em}.score-card{background:#111;color:#fff;padding:28px;min-height:260px;display:flex;flex-direction:column}.score-card span{font:10px monospace;color:#e1261c}.score-card strong{font-size:88px;line-height:.85;letter-spacing:-.08em;margin-top:auto}.score-card b{font-size:11px;margin-top:12px}.score-card p{font-size:11px;line-height:1.6;color:#888;margin:8px 0 0}.journey-section{padding:78px 0 105px}.journey-section>h2{margin:42px 0 32px}.journey-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#d8d6d0;border:1px solid #d8d6d0}.journey-cards>a,.journey-cards>div{background:#fff;color:#111;text-decoration:none;padding:28px;min-height:220px;display:flex;flex-direction:column}.journey-cards span{font:10px monospace;color:#999}.journey-cards strong{font-size:23px;margin-top:auto}.journey-cards p{color:#6f6c66;font-size:12px;line-height:1.65;margin:8px 0 18px}.journey-cards b{font:9px monospace;letter-spacing:.08em}.journey-cards>a:hover{background:#111;color:#fff}.principles{padding:0 0 105px}.principle-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#d8d6d0;border:1px solid #d8d6d0}.principle-grid article{background:#fff;padding:28px;min-height:205px}.principle-grid h3{font-size:23px;letter-spacing:-.04em;margin:34px 0 10px}.principle-grid p{color:#777;font-size:12px;line-height:1.7;margin:0}.benefits{background:#111;color:#fff}.benefits-inner{width:min(1160px,calc(100% - 40px));margin:auto;padding:80px 0 90px}.benefits h2{margin-bottom:38px}.benefit-list{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid #37352f}.benefit-list span{padding:16px 0;border-bottom:1px solid #37352f;font:10px monospace;color:#aaa;letter-spacing:.08em}.benefit-note{max-width:590px;color:#777;font-size:12px;line-height:1.7;margin:30px 0}.cta{display:inline-flex;background:#fff;color:#111;text-decoration:none;padding:15px 18px;font-size:10px;font-weight:900}.cta:hover{background:#e1261c;color:#fff}.code-section{padding:78px 0 100px;display:grid;grid-template-columns:1fr 1fr;gap:70px}.code-section>div>p:not(.eyebrow){color:#777;font-size:13px;line-height:1.7;max-width:480px}.code-form{display:flex;gap:8px}.code-form input{flex:1;min-width:0;background:#fff;border:1px solid #ccc9c2;padding:14px;font-size:13px;text-transform:uppercase;outline:none}.code-form input:focus{border-color:#e1261c}.code-form button{border:0;background:#111;color:#fff;padding:14px 18px;font-weight:800;cursor:pointer}.code-form button:disabled{opacity:.5}.code-error{margin-top:12px;color:#c51d16;font-size:12px}.member-result{margin-top:16px;border:1px solid #ccc9c2;padding:20px;display:grid;grid-template-columns:1fr auto;gap:16px}.member-result>div:first-child span{font:9px monospace;color:#e1261c}.member-result h3{font-size:23px;margin:7px 0 3px}.member-result p{font-size:12px;color:#777;margin:0}.member-result>strong{font:9px monospace;border:1px solid #bbb;padding:7px;height:max-content}.benefit-result{grid-column:1/-1;border-top:1px solid #ddd;padding-top:14px;color:#666;font-size:11px}.benefit-result ul{margin:8px 0 0;padding-left:17px;line-height:1.7}.footer{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:25px clamp(16px,5vw,60px);background:#e1261c;color:#fff;font:9px monospace;letter-spacing:.08em}.footer .mark{background:#111}.footer a{color:#fff;text-decoration:none}.loading{padding:120px 20px;background:#0b0b0a;color:#888;font:11px monospace;letter-spacing:.12em}
        @media(max-width:760px){.topbar{padding:17px 14px}.top-links{gap:14px}.top-links a{font-size:8px}.hero-inner,.journey-intro,.journey-section,.principles,.code-section,.index-inner,.benefits-inner{width:calc(100% - 28px)}.hero-inner{padding:60px 0 65px}.hero-copy{grid-template-columns:1fr;gap:30px}.hero h1{font-size:clamp(52px,16vw,76px);line-height:.86;letter-spacing:-.07em}.lead{font-size:13px;line-height:1.7;margin-top:24px}.member-badge{padding:20px}.journey-intro{padding:55px 0 70px}.section-label{font-size:8px;line-height:1.4}.journey-grid{grid-template-columns:1fr;gap:25px;padding:34px 0}.journey-grid h2,.journey-section>h2,.benefits h2,.code-section h2{font-size:clamp(39px,12vw,58px);line-height:.9}.journey-text p{font-size:13px;line-height:1.7}.ecosystem{grid-template-columns:1fr}.ecosystem div{min-height:105px;padding:21px}.ecosystem strong{margin-top:22px;font-size:18px}.index-inner{grid-template-columns:1fr;gap:35px;padding:58px 0 65px}.index-inner h2{font-size:clamp(42px,12vw,60px)}.index-copy{font-size:13px;line-height:1.7;margin:22px 0}.score-card{min-height:220px;padding:22px}.score-card strong{font-size:72px}.journey-section{padding:58px 0 72px}.journey-section>h2{margin:32px 0 24px}.journey-cards{grid-template-columns:1fr}.journey-cards>a,.journey-cards>div{min-height:175px;padding:23px}.journey-cards strong{margin-top:27px;font-size:21px}.journey-cards p{font-size:12px}.principles{padding-bottom:70px}.principle-grid{grid-template-columns:1fr}.principle-grid article{min-height:0;padding:24px}.principle-grid h3{font-size:22px;margin:24px 0 9px}.principle-grid p{font-size:12px;line-height:1.65}.benefits-inner{padding:60px 0 68px}.benefit-list{grid-template-columns:1fr}.benefit-list span{padding:14px 0}.benefit-note{font-size:12px;line-height:1.7}.cta{width:100%;justify-content:center;text-align:center}.code-section{grid-template-columns:1fr;gap:30px;padding:58px 0 70px}.code-section>div>p:not(.eyebrow){font-size:12px}.code-form{display:grid;grid-template-columns:1fr}.code-form button{width:100%}.member-result{grid-template-columns:1fr}.member-result>strong{width:max-content}.benefit-result{grid-column:auto}.footer{display:grid;gap:13px;padding:24px 14px;font-size:8px}.footer span{order:3}.footer a:last-child{order:2}}
      `}</style>
    </main>
  );
}
