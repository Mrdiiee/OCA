import Link from "next/link";

export default function Tentang(){
  return <main className="page">
    <style>{`body{margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}.page{min-height:100vh;padding:0 clamp(20px,5vw,72px);background:#fff}.page a{color:#111}.back{display:inline-flex;align-items:center;min-height:76px;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:.06em;border-bottom:1px solid #e5e5e5;width:100%}.content{max-width:1180px;margin:0 auto;padding:92px 0 110px}.eyebrow{color:#e1261c;letter-spacing:2px;font:700 10px monospace}.title{font-size:clamp(58px,10vw,132px);line-height:.84;letter-spacing:-.065em;margin:16px 0 48px}.title span{color:#e1261c}.intro{max-width:920px;font-size:clamp(24px,3.1vw,42px);line-height:1.2;letter-spacing:-.035em;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#e5e5e5;margin-top:78px;border:1px solid #e5e5e5}.card{background:#fff;padding:30px;min-height:170px}.label{font:700 10px monospace;letter-spacing:.12em;color:#e1261c}.card h2{font-size:24px;letter-spacing:-.03em;margin:22px 0 10px}.card p{color:#6b6b6b;font-size:13px;line-height:1.7;margin:0}.rule{height:1px;background:#e5e5e5;margin-top:78px}.statement{display:grid;grid-template-columns:1fr 1.5fr;gap:50px;padding-top:30px}.statement strong{font-size:13px;letter-spacing:.08em}.statement p{margin:0;color:#555;font-size:16px;line-height:1.8}@media(max-width:700px){.content{padding:62px 0 80px}.grid{grid-template-columns:1fr;margin-top:54px}.card{min-height:auto}.statement{grid-template-columns:1fr;gap:20px}}`}</style>
    <Link className="back" href="/">← OXYGEN GEAR</Link>
    <section className="content">
      <div className="eyebrow">03 / ABOUT OXYGEN GEAR</div>
      <h1 className="title">TENTANG<br/><span>KAMI.</span></h1>
      <p className="intro">Oxygen Gear Equipment lahir dari perjalanan di medan terbuka — dari kebutuhan akan perlengkapan yang benar-benar bisa diandalkan, sampai keinginan untuk membangun perjalanan yang lebih berarti.</p>
      <div className="grid">
        <article className="card"><div className="label">01 / EQUIPMENT</div><h2>Field tested.</h2><p>Kami memilih dan mengembangkan perlengkapan dengan perhatian pada fungsi, ketahanan, dan kenyamanan saat digunakan di lapangan.</p></article>
        <article className="card"><div className="label">02 / ADVENTURE</div><h2>Go further.</h2><p>Perjalanan bukan sekadar sampai tujuan. Kami membuat perlengkapan dan layanan yang membantu orang berani pergi lebih jauh.</p></article>
        <article className="card"><div className="label">03 / COMMUNITY</div><h2>Walk together.</h2><p>Berawal dari komunitas pendakian, Oxygen Gear tetap membawa semangat berbagi pengalaman, belajar, dan bertumbuh bersama.</p></article>
      </div>
      <div className="rule"/>
      <div className="statement"><strong>OUR APPROACH</strong><p>Equipment · Adventure · Community.<br/>Tiga hal yang menjadi dasar setiap produk, perjalanan, dan pengalaman yang kami bangun.</p></div>
    </section>
  </main>
}` }