import { createServerSupabaseClient } from '../../lib/supabase-server';

const CATEGORIES = [
  ['PENDAKIAN BERSAMA', 'Berjalan bersama komunitas dan menemukan pengalaman baru di jalur yang sama.'],
  ['EKSPEDISI', 'Perjalanan dengan tantangan lebih besar, persiapan lebih matang, dan cerita yang lebih jauh.'],
  ['PRIVATE TRIP', 'Perjalanan yang lebih personal, fleksibel, dan disusun sesuai kebutuhan perjalananmu.'],
];
const principles = [['01','BERJALAN','Bukan sekadar sampai puncak. Kami percaya perjalanan adalah bagian dari pengalaman.'],['02','BERSAMA','Event dibuat untuk mempertemukan orang-orang yang punya rasa ingin tahu dan semangat yang sama.'],['03','BERTANGGUNG JAWAB','Persiapan, keselamatan, dan rasa hormat terhadap alam menjadi bagian dari setiap perjalanan.']];

export default async function EventPage({ searchParams }) {
  const params = await searchParams;
  const selected = typeof params?.type === 'string' ? params.type.toUpperCase() : '';
  const category = CATEGORIES.some(([type]) => type === selected) ? selected : '';
  const supabase = await createServerSupabaseClient();
  const { data: events = [] } = await supabase.from('events').select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  const filteredEvents = category ? events.filter(event => String(event.type || '').toUpperCase() === category) : [];
  const wrap = { width:'min(1160px,calc(100% - 40px))', margin:'0 auto' }, mono={fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace'};
  return <main style={{minHeight:'100vh',background:'#f7f7f5',color:'#111',fontFamily:'Arial,Helvetica,sans-serif'}}>
    <div style={{background:'#111',color:'#fff',padding:'9px 16px',textAlign:'center',fontSize:10,fontWeight:800,letterSpacing:'.14em'}}>OXYGEN GEAR · EVENT</div>
    <header style={{position:'sticky',top:0,zIndex:30,background:'rgba(247,247,245,.94)',backdropFilter:'blur(16px)',borderBottom:'1px solid #dededb'}}><div style={{...wrap,minHeight:72,display:'flex',alignItems:'center',justifyContent:'space-between',gap:20}}><a href="/" style={{color:'#111',textDecoration:'none',fontSize:12,fontWeight:900}}>← OXYGEN GEAR</a><a href="/produk" style={{color:'#111',textDecoration:'none',fontSize:10,fontWeight:800}}>LIHAT PRODUK →</a></div></header>
    <section className="event-hero" style={{background:'#111',color:'#fff'}}><div style={{...wrap,padding:'clamp(64px,10vw,125px) 0 100px'}}><p style={{...mono,color:'#e1261c',fontSize:10,fontWeight:700,letterSpacing:'.15em'}}>01 / OXYGEN GEAR EVENT</p><h1 style={{fontSize:'clamp(58px,10.5vw,138px)',lineHeight:.82,letterSpacing:'-.07em',margin:'20px 0 0'}}>GO FURTHER<br/><span style={{color:'#e1261c'}}>TOGETHER.</span></h1><p style={{color:'#b7b7b3',fontSize:15,lineHeight:1.8,maxWidth:620,marginTop:42}}>Pilih jenis perjalanan yang kamu cari. Setelah itu, kami tampilkan event yang sesuai dengan pilihanmu.</p></div></section>
    <section className="event-categories" style={{...wrap,padding:'70px 0 110px'}}><p style={{...mono,color:'#e1261c',fontSize:10,fontWeight:700,letterSpacing:'.14em'}}>02 / PILIH JENIS PERJALANAN</p><h2 style={{fontSize:'clamp(30px,5vw,58px)',lineHeight:.95,letterSpacing:'-.055em',margin:'10px 0 30px'}}>CHOOSE YOUR<br/>NEXT MOVE.</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:1,background:'#dcdcd8',border:'1px solid #dcdcd8'}}>{CATEGORIES.map(([type,description],index)=>{const active=category===type;return <a key={type} href={`/event?type=${encodeURIComponent(type)}`} style={{background:active?'#111':'#fff',color:active?'#fff':'#111',padding:'clamp(25px,4vw,42px)',minHeight:260,textDecoration:'none',display:'flex',flexDirection:'column',justifyContent:'space-between',transition:'all .2s'}}><div><span style={{...mono,color:active?'#e1261c':'#aaa',fontSize:11}}>0{index+1}</span><h3 style={{fontSize:'clamp(24px,3vw,38px)',lineHeight:.95,letterSpacing:'-.045em',margin:'18px 0 14px'}}>{type}</h3><p style={{color:active?'#aaa':'#666',fontSize:12,lineHeight:1.7,maxWidth:300,margin:0}}>{description}</p></div><span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em'}}>{active?'DIPILIH ✓':'LIHAT EVENT →'}</span></a>})}</div></section>
    {category&&<section className="event-list" style={{...wrap,padding:'0 0 110px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:20,flexWrap:'wrap',marginBottom:22}}><div><p style={{...mono,color:'#e1261c',fontSize:10,fontWeight:700,letterSpacing:'.14em',margin:0}}>03 / {category}</p><h2 style={{fontSize:'clamp(30px,5vw,58px)',lineHeight:.95,letterSpacing:'-.055em',margin:'10px 0 0'}}>EVENT {category}.</h2></div><a href="/event" style={{color:'#111',fontSize:10,fontWeight:800,textDecoration:'none'}}>← GANTI KATEGORI</a></div><div style={{display:'grid',gap:1,background:'#dcdcd8',border:'1px solid #dcdcd8'}}>{filteredEvents.map((event,index)=>{const meta=Array.isArray(event.meta)?event.meta:[];return <article key={event.id} style={{background:'#fff',padding:'clamp(20px,4vw,42px)',display:'grid',gridTemplateColumns:'110px minmax(0,1fr) auto',gap:'clamp(18px,3vw,38px)',alignItems:'center'}}>{event.cover_image_url?<img src={event.cover_image_url} alt="" style={{width:110,height:85,objectFit:'cover',border:'1px solid #ddd'}}/>:<span style={{...mono,color:'#b1b1ad',fontSize:11}}>0{index+1}</span>}<div><div style={{display:'flex',flexWrap:'wrap',gap:10}}><span style={{...mono,color:'#e1261c',fontSize:10,fontWeight:700}}>{event.type}</span>{meta[0]?.[1]&&<span style={{...mono,color:'#999',fontSize:9}}>{meta[0][1]}</span>}</div><h3 style={{fontSize:'clamp(25px,4vw,45px)',lineHeight:.95,letterSpacing:'-.045em',margin:'11px 0 13px'}}>{event.title}</h3><p style={{maxWidth:650,color:'#666',fontSize:13,lineHeight:1.75,margin:0}}>{event.subtitle||event.description}</p>{event.event_date&&<p style={{color:'#999',fontSize:10,marginTop:12}}>EVENT: {new Date(event.event_date).toLocaleString('id-ID')}</p>}</div><div style={{minWidth:130,textAlign:'right'}}><a href={`/event/${event.slug}`} style={{display:'inline-flex',padding:'14px 17px',background:'#111',color:'#fff',textDecoration:'none',fontSize:10,fontWeight:800}}>{event.status==='TERSEDIA'?'DAFTAR EVENT →':'LIHAT DETAIL →'}</a></div></article>})}</div>{filteredEvents.length===0&&<div style={{padding:50,textAlign:'center',color:'#777',background:'#fff',border:'1px solid #dcdcd8'}}>Belum ada event {category} yang dipublikasikan.</div>}</section>}
    <section className="event-way" style={{background:'#e1261c',color:'#fff'}}><div style={{...wrap,padding:'72px 0 82px'}}><p style={{...mono,fontSize:10,fontWeight:700}}>{category?'04':'03'} / OUR WAY</p><h2 style={{fontSize:'clamp(38px,6vw,76px)',lineHeight:.9,letterSpacing:'-.06em'}}>THE OUTDOOR<br/>IS BETTER<br/>TOGETHER.</h2></div></section>
    <section className="event-principles" style={{...wrap,padding:'78px 0 105px'}}><p style={{...mono,color:'#e1261c',fontSize:10,fontWeight:700}}> {category?'05':'04'} / PRINCIPLES</p><div className="event-principles-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:1,background:'#dcdcd8',border:'1px solid #dcdcd8'}}>{principles.map(([n,t,c])=><div className="event-principle-card" key={n} style={{background:'#fff',padding:28,minHeight:180}}><span style={{...mono,color:'#aaa',fontSize:10}}>{n}</span><h3>{t}</h3><p style={{color:'#777',fontSize:12,lineHeight:1.7}}>{c}</p></div>)}</div></section>
    <section className="event-final" style={{background:'#111',color:'#fff'}}><div style={{...wrap,padding:'62px 0 68px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:30,flexWrap:'wrap'}}><h2 style={{fontSize:'clamp(30px,4vw,48px)',letterSpacing:'-.05em'}}>YOUR NEXT ADVENTURE STARTS HERE.</h2><a href="/kontak" style={{background:'#fff',color:'#111',textDecoration:'none',padding:'15px 19px',fontSize:10,fontWeight:800}}>TANYAKAN EVENT →</a></div></section>
    <style>{`@media(max-width:760px){
      main{overflow-x:hidden}
      main>div:first-child{font-size:9px!important;letter-spacing:.09em!important}
      main>header>div{min-height:62px!important;width:calc(100% - 28px)!important;gap:12px!important}
      main>header a{font-size:10px!important;white-space:nowrap}
      .event-hero>div{width:calc(100% - 28px)!important;padding:68px 0 72px!important}
      .event-hero h1{font-size:clamp(48px,15vw,70px)!important;line-height:.86!important;letter-spacing:-.065em!important;overflow-wrap:normal!important;word-break:normal!important}
      .event-hero p:last-child{font-size:13px!important;line-height:1.65!important;margin-top:28px!important;max-width:100%!important}
      .event-categories{width:calc(100% - 28px)!important;padding:54px 0 72px!important}
      .event-categories>h2{font-size:34px!important;line-height:.92!important;margin:9px 0 24px!important}
      .event-categories>div{grid-template-columns:1fr!important}
      .event-categories>div>a{min-height:0!important;padding:24px!important;gap:28px!important}
      .event-categories>div>a h3{font-size:27px!important;line-height:1!important;margin:13px 0 12px!important;overflow-wrap:anywhere!important}
      .event-categories>div>a p{font-size:12px!important;line-height:1.6!important;max-width:none!important}
      .event-categories>div>a>span:last-child{font-size:9px!important}
      .event-list{width:calc(100% - 28px)!important;padding:0 0 72px!important}
      .event-list>div:first-child{align-items:flex-start!important;flex-direction:column!important;gap:12px!important}
      .event-list h2{font-size:32px!important;line-height:.95!important;overflow-wrap:anywhere!important}
      .event-list article{grid-template-columns:1fr!important;padding:22px!important;gap:16px!important;align-items:start!important}
      .event-list article>img{width:100%!important;height:190px!important}
      .event-list article>div{min-width:0!important}
      .event-list article h3{font-size:30px!important;line-height:.98!important;overflow-wrap:anywhere!important;word-break:normal!important}
      .event-list article p{font-size:12px!important;line-height:1.65!important;overflow-wrap:anywhere!important}
      .event-list article>div:last-child{text-align:left!important;min-width:0!important;width:100%!important}
      .event-list article>div:last-child a{width:100%!important;justify-content:center!important;box-sizing:border-box!important}
      .event-way>div{width:calc(100% - 28px)!important;padding:58px 0 64px!important}
      .event-way h2{font-size:46px!important;line-height:.9!important}
      .event-principles{width:calc(100% - 28px)!important;padding:58px 0 76px!important}
      .event-principles>p{margin:0 0 20px!important}
      .event-principles-grid{grid-template-columns:1fr!important;gap:1px!important;width:100%!important}
      .event-principle-card{min-height:0!important;padding:22px!important;box-sizing:border-box!important}
      .event-principle-card h3{font-size:24px!important;line-height:1!important;letter-spacing:-.035em!important;margin:11px 0 9px!important;overflow-wrap:anywhere!important}
      .event-principle-card p{font-size:12px!important;line-height:1.65!important;margin:0!important;max-width:none!important;overflow-wrap:anywhere!important}
      .event-final>div{width:calc(100% - 28px)!important;padding:48px 0 54px!important;align-items:flex-start!important}
      .event-final h2{font-size:31px!important;line-height:.95!important;max-width:100%!important;margin:0!important;overflow-wrap:anywhere!important}
      .event-final a{width:100%!important;text-align:center!important;box-sizing:border-box!important}
    }`}</style>
  </main>;
}
