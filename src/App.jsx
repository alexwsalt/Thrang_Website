import { useState, useEffect } from "react";

const C = {
  slate900: "#1e2a35", slate800: "#243040", slate700: "#2f3f52",
  slate600: "#4a5e72", slate400: "#7a95aa", slate300: "#b0c4d4",
  slate200: "#d6e4ee", slate100: "#eaf2f7", slate50:  "#f4f8fb",
  lake700:  "#1a5276", lake600:  "#1f6390", lake500:  "#2471a3",
  lake400:  "#3498db", lake300:  "#7fb3d3", lake100:  "#d6eaf8",
  white: "#ffffff", fog: "#f0f5f9", mist: "#e8f1f7",
  err: "#c0392b", errBg: "#fdf0ee", errBorder: "#e8c4bc",
};
const FF = "'Playfair Display', Georgia, serif";
const FB = "'Source Serif 4', Georgia, serif";

const ACCESS_PASSWORD = "sunshine2024";
const PROPERTIES = {
  oldThrang: {
    id: "oldThrang", name: "Old Thrang", sleeps: 7,
    tagline: "A traditional Lakeland farmhouse for up to 7 guests",
    description: "Old Thrang is a beautifully restored Lakeland farmhouse nestled in the Great Langdale Valley. With original stone walls, oak beams, and a wood-burning stove, it blends rustic charm with modern comfort — the perfect retreat for a group looking to escape to the fells.",
    bookedRanges: [
      { start: new Date(2026,4,10), end: new Date(2026,4,17) },
      { start: new Date(2026,5,5),  end: new Date(2026,5,12) },
    ],
  },
  thrangGarth: {
    id: "thrangGarth", name: "Thrang Garth", sleeps: 11,
    tagline: "A spacious Lakeland retreat for up to 11 guests",
    description: "Thrang Garth is a generous, characterful property perfect for larger groups seeking the very best of the Lake District. Set within the stunning Great Langdale Valley, it offers ample space, beautiful interiors, and direct access to some of the finest walking in England.",
    bookedRanges: [
      { start: new Date(2026,4,20), end: new Date(2026,4,27) },
      { start: new Date(2026,5,15), end: new Date(2026,5,22) },
    ],
  },
};

function isSameDay(a,b){ return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function isInRange(date,start,end){
  if(!start||!end)return false;
  const n=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  return n(date)>=n(start)&&n(date)<=n(end);
}
function isBooked(date,ranges){ return ranges.some(r=>isInRange(date,r.start,r.end)); }
function isPast(date){ const t=new Date();t.setHours(0,0,0,0);const d=new Date(date);d.setHours(0,0,0,0);return d<t; }
function formatDate(d){ if(!d)return""; return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }
function nightsBetween(a,b){ if(!a||!b)return 0; return Math.round(Math.abs((b-a)/(1000*60*60*24))); }
function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

function Calendar({checkIn,checkOut,onSelectDate,hoverDate,onHoverDate,bookedRanges}){
  const today=new Date();
  const [vy,setVy]=useState(today.getFullYear());
  const [vm,setVm]=useState(today.getMonth());
  const prevM=()=>vm===0?(setVm(11),setVy(y=>y-1)):setVm(m=>m-1);
  const nextM=()=>vm===11?(setVm(0),setVy(y=>y+1)):setVm(m=>m+1);
  const cells=[...Array(getFirstDay(vy,vm)).fill(null),...Array(getDaysInMonth(vy,vm)).fill(0).map((_,i)=>new Date(vy,vm,i+1))];
  const rangeEnd=checkOut||hoverDate;
  return(
    <div style={{fontFamily:FB}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        {[prevM,"",nextM].map((fn,i)=>i===1
          ?<span key="title" style={{fontSize:16,fontWeight:600,color:C.slate800,letterSpacing:"0.04em",fontFamily:FF}}>{MONTHS[vm]} {vy}</span>
          :<button key={i} onClick={fn} style={{background:"none",border:`1px solid ${C.slate300}`,width:32,height:32,borderRadius:"50%",cursor:"pointer",color:C.slate600,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center"}}>{i===0?"‹":"›"}</button>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:5}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:C.slate400,letterSpacing:"0.1em",padding:"3px 0",textTransform:"uppercase"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((date,i)=>{
          if(!date)return<div key={"e"+i}/>;
          const booked=isBooked(date,bookedRanges),past=isPast(date),dis=booked||past;
          const isStart=checkIn&&isSameDay(date,checkIn),isEnd=checkOut&&isSameDay(date,checkOut);
          const inRng=checkIn&&rangeEnd&&!isSameDay(checkIn,rangeEnd)&&isInRange(date,checkIn<rangeEnd?checkIn:rangeEnd,checkIn<rangeEnd?rangeEnd:checkIn);
          const isTdy=isSameDay(date,today);
          let bg=C.fog,col=C.slate800,cur="pointer",brd="1px solid transparent",fw=400,op=1;
          if(dis){bg=booked?"#fde8e4":C.slate100;col=booked?"#c0705a":C.slate300;cur="not-allowed";op=booked?1:0.5;}
          else if(isStart||isEnd){bg=C.lake600;col="#fff";fw=700;brd=`1px solid ${C.lake600}`;}
          else if(inRng){bg=C.lake100;col=C.lake700;}
          else if(isTdy){brd=`2px solid ${C.lake500}`;col=C.lake600;fw=700;}
          return(
            <div key={date.toString()} onClick={()=>!dis&&onSelectDate(date)}
              onMouseEnter={()=>!dis&&onHoverDate(date)} onMouseLeave={()=>onHoverDate(null)}
              style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,background:bg,color:col,cursor:cur,border:brd,fontWeight:fw,fontSize:13,position:"relative",transition:"all 0.1s",opacity:op}}>
              {date.getDate()}
              {booked&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:"#c0705a"}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:14,marginTop:14,flexWrap:"wrap"}}>
        {[[C.fog,"Available"],[C.lake100,"In range"],[C.lake600,"Selected"],["#fde8e4","Unavailable"]].map(([bg,label])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.slate400}}>
            <div style={{width:11,height:11,borderRadius:3,background:bg,border:`1px solid ${C.slate200}`}}/>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateChip({label,value}){
  const filled=!!value;
  return(
    <div style={{background:filled?C.mist:C.fog,border:`1.5px solid ${filled?C.lake300:C.slate200}`,borderRadius:10,padding:"10px 18px",minWidth:148,transition:"all 0.2s"}}>
      <div style={{fontSize:9,letterSpacing:"0.18em",color:C.slate400,fontWeight:700,marginBottom:3,textTransform:"uppercase",fontFamily:FB}}>{label}</div>
      <div style={{fontSize:15,fontWeight:600,color:filled?C.slate800:C.slate300,fontFamily:FB}}>{filled?formatDate(value):"—"}</div>
    </div>
  );
}

function BookingPanel({property}){
  const [checkIn,setCheckIn]=useState(null);
  const [checkOut,setCheckOut]=useState(null);
  const [hover,setHover]=useState(null);
  const [form,setForm]=useState({name:"",email:"",phone:"",message:""});
  const [submitted,setSubmitted]=useState(false);
  const [error,setError]=useState("");
  const handleSelect=date=>{
    if(!checkIn||(checkIn&&checkOut)){setCheckIn(date);setCheckOut(null);return;}
    if(isSameDay(date,checkIn)){setCheckIn(null);return;}
    const [s,e]=date<checkIn?[date,checkIn]:[checkIn,date];
    if(property.bookedRanges.some(r=>!(r.end<s||r.start>e))){setError("That range includes unavailable dates — please choose again.");return;}
    setError("");setCheckIn(s);setCheckOut(e);
  };
  const nights=nightsBetween(checkIn,checkOut);
  const handleSubmit=()=>{
    if(!checkIn||!checkOut){setError("Please select check-in and check-out dates.");return;}
    if(!form.name||!form.email){setError("Please enter your name and email address.");return;}
    setError("");setSubmitted(true);
  };
  const reset=()=>{setSubmitted(false);setCheckIn(null);setCheckOut(null);setForm({name:"",email:"",phone:"",message:""});};
  const inp={padding:"12px 14px",border:`1.5px solid ${C.slate200}`,borderRadius:8,fontSize:15,fontFamily:FB,color:C.slate800,background:C.fog,outline:"none",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:11,fontWeight:700,color:C.slate400,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:FB,marginBottom:5,display:"block"};
  if(submitted)return(
    <div style={{textAlign:"center",padding:"52px 24px"}}>
      <div style={{width:60,height:60,background:C.lake600,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#fff",margin:"0 auto 20px",boxShadow:`0 4px 20px ${C.lake300}`}}>✓</div>
      <h3 style={{fontSize:24,fontWeight:700,color:C.slate800,marginBottom:10,fontFamily:FF}}>Request Received</h3>
      <p style={{fontSize:15,color:C.slate600,lineHeight:1.75,maxWidth:440,margin:"0 auto 28px",fontFamily:FB}}>
        Thank you, <strong>{form.name}</strong>. Your enquiry for <strong>{property.name}</strong> from <strong>{formatDate(checkIn)}</strong> to <strong>{formatDate(checkOut)}</strong> ({nights} night{nights!==1?"s":""}) has been received. We'll be in touch at <strong>{form.email}</strong>.
      </p>
      <button onClick={reset} style={{background:"none",border:`1.5px solid ${C.lake500}`,color:C.lake600,padding:"10px 28px",borderRadius:8,cursor:"pointer",fontSize:14,fontFamily:FB}}>Make Another Request</button>
    </div>
  );
  return(
    <div>
      <p style={{fontSize:15,color:C.slate600,lineHeight:1.8,marginBottom:24,fontFamily:FB}}>{property.description}</p>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <DateChip label="Check-in"  value={checkIn}/>
        <div style={{color:C.slate300,fontSize:18}}>→</div>
        <DateChip label="Check-out" value={checkOut}/>
        {nights>0&&<div style={{background:C.lake600,color:"#fff",borderRadius:20,padding:"7px 16px",fontSize:13,fontWeight:600,fontFamily:FB,marginLeft:4,boxShadow:`0 2px 12px ${C.lake300}`}}>{nights} night{nights!==1?"s":""}</div>}
      </div>
      <p style={{fontSize:12,color:C.slate400,marginBottom:16,fontFamily:FB}}>Click a start date, then click an end date to select your stay.</p>
      <div style={{background:C.white,border:`1px solid ${C.slate200}`,borderRadius:14,padding:24,marginBottom:24,boxShadow:`0 1px 6px rgba(30,42,53,0.05)`}}>
        <Calendar checkIn={checkIn} checkOut={checkOut} onSelectDate={handleSelect} hoverDate={hover} onHoverDate={setHover} bookedRanges={property.bookedRanges}/>
      </div>
      {error&&<div style={{background:C.errBg,border:`1px solid ${C.errBorder}`,borderRadius:8,padding:"11px 16px",fontSize:13,color:C.err,marginBottom:20,fontFamily:FB}}>{error}</div>}
      <div style={{display:"flex",alignItems:"center",gap:12,margin:"28px 0 24px"}}>
        <div style={{flex:1,height:1,background:C.slate200}}/>
        <span style={{fontSize:10,color:C.slate400,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:FB}}>Your Details</span>
        <div style={{flex:1,height:1,background:C.slate200}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 20px",marginBottom:28}}>
        {[{label:"Full Name *",key:"name",type:"text",ph:"Jane Smith"},{label:"Email Address *",key:"email",type:"email",ph:"jane@email.com"},{label:"Phone Number",key:"phone",type:"text",ph:"+44 7700 000000"},{label:"Message",key:"message",type:"area",ph:"Any questions or special requests…"}].map(({label,key,type,ph})=>(
          <div key={key} style={{display:"flex",flexDirection:"column"}}>
            <label style={lbl}>{label}</label>
            {type==="area"?<textarea placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{...inp,height:82,resize:"vertical"}}/>:<input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inp}/>}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} style={{background:C.lake600,color:"#fff",border:"none",padding:"15px 42px",borderRadius:10,cursor:"pointer",fontSize:16,fontFamily:FF,fontWeight:700,letterSpacing:"0.03em",boxShadow:`0 4px 18px ${C.lake300}`}}>
        Request Booking →
      </button>
    </div>
  );
}

function BookingPage(){
  const [active,setActive]=useState("oldThrang");
  const p=PROPERTIES[active];
  return(
    <div style={{maxWidth:880,margin:"0 auto",padding:"48px 28px",fontFamily:FB}}>
      <div style={{marginBottom:36}}>
        <p style={{fontSize:11,letterSpacing:"0.22em",textTransform:"uppercase",color:C.slate400,marginBottom:8,fontFamily:FB}}>Great Langdale Valley · Lake District</p>
        <h1 style={{fontSize:34,fontWeight:700,color:C.slate800,margin:0,fontFamily:FF,letterSpacing:"-0.5px"}}>Choose your property</h1>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:36}}>
        {Object.values(PROPERTIES).map(prop=>{
          const sel=active===prop.id;
          return(
            <button key={prop.id} onClick={()=>setActive(prop.id)} style={{padding:"18px 22px",border:`2px solid ${sel?C.lake500:C.slate200}`,borderRadius:14,background:sel?C.lake600:C.white,color:sel?C.white:C.slate700,cursor:"pointer",fontFamily:FB,transition:"all 0.2s",textAlign:"left",boxShadow:sel?`0 4px 20px ${C.lake300}`:"none"}}>
              <div style={{fontSize:17,fontWeight:700,marginBottom:4,fontFamily:FF}}>{prop.name}</div>
              <div style={{fontSize:13,opacity:0.75}}>Sleeps {prop.sleeps}</div>
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,paddingBottom:24,borderBottom:`1px solid ${C.slate200}`}}>
        <div>
          <h2 style={{fontSize:26,fontWeight:700,color:C.slate800,margin:"0 0 5px",fontFamily:FF}}>{p.name}</h2>
          <p style={{fontSize:14,color:C.slate400,fontStyle:"italic",margin:0,fontFamily:FB}}>{p.tagline}</p>
        </div>
        <div style={{textAlign:"center",background:C.mist,border:`1px solid ${C.slate200}`,borderRadius:12,padding:"12px 22px",flexShrink:0}}>
          <div style={{fontSize:28,fontWeight:700,color:C.lake600,lineHeight:1,fontFamily:FF}}>{p.sleeps}</div>
          <div style={{fontSize:10,color:C.slate400,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:FB}}>guests</div>
        </div>
      </div>
      <div style={{background:C.white,borderRadius:18,padding:"36px 40px",border:`1px solid ${C.slate200}`,boxShadow:`0 4px 32px rgba(30,42,53,0.07)`}}>
        <BookingPanel key={active} property={p}/>
      </div>
    </div>
  );
}

export default function App(){
  const [page,setPage]=useState("home");
  const [password,setPassword]=useState("");
  const [pwError,setPwError]=useState("");
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{setTimeout(()=>setMounted(true),50);},[]);
  const login=()=>{
    if(password===ACCESS_PASSWORD){setPwError("");setPage("booking");}
    else setPwError("Incorrect password — please try again.");
  };
  return(
    <div style={{fontFamily:FB,background:C.slate50,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        *{box-sizing:border-box;}
        button{transition:opacity 0.15s,box-shadow 0.15s;}
        button:hover{opacity:0.88;}
        input:focus,textarea:focus{border-color:#2471a3!important;}
      `}</style>

      {/* HEADER */}
      <header style={{background:"rgba(244,248,251,0.96)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.slate200}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58}}>
          <div onClick={()=>setPage("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.lake600},${C.slate700})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff"}}>⌂</div>
            <span style={{fontSize:19,fontWeight:700,letterSpacing:"-0.5px",color:C.slate800,fontFamily:FF}}>Thrang</span>
          </div>
          <nav style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",padding:"7px 14px",fontSize:14,color:C.slate600,fontFamily:FB}}>Home</button>
            <button onClick={()=>setPage(page==="booking"?"booking":"login")} style={{background:C.lake600,color:"#fff",border:"none",padding:"8px 22px",borderRadius:20,cursor:"pointer",fontSize:14,fontFamily:FB,fontWeight:600,boxShadow:`0 2px 12px ${C.lake300}`}}>
              {page==="booking"?"My Booking":"Book Now"}
            </button>
          </nav>
        </div>
      </header>

      <main style={{flex:1}}>
        {/* HOME */}
        {page==="home"&&(
          <div style={{opacity:mounted?1:0,transition:"opacity 0.55s"}}>
            <section style={{position:"relative",minHeight:580,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg, ${C.slate900} 0%, ${C.slate800} 45%, ${C.lake700} 100%)`}}/>
              <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 20% 80%, rgba(31,99,144,0.4) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(46,94,120,0.2) 0%, transparent 50%)`,pointerEvents:"none"}}/>
              <svg style={{position:"absolute",bottom:0,left:0,right:0,width:"100%",opacity:0.07}} viewBox="0 0 1200 200" preserveAspectRatio="none">
                <path d="M0,200 L0,120 L150,60 L300,100 L500,20 L700,90 L900,30 L1100,80 L1200,50 L1200,200Z" fill="#fff"/>
              </svg>
              <div style={{position:"relative",textAlign:"center",color:"#fff",padding:"60px 24px",maxWidth:680}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.1)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:20,padding:"6px 16px",marginBottom:28,fontSize:11,letterSpacing:"0.22em",textTransform:"uppercase",fontFamily:FB}}>
                  📍 Great Langdale Valley, Lake District
                </div>
                <h1 style={{fontSize:80,fontWeight:700,margin:"0 0 14px",letterSpacing:"-3px",lineHeight:0.95,fontFamily:FF}}>Thrang</h1>
                <p style={{fontSize:18,opacity:0.72,marginBottom:44,fontStyle:"italic",lineHeight:1.55,fontFamily:FF}}>Two exceptional properties in the heart of the Lakeland fells</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:44,flexWrap:"wrap"}}>
                  {[["Old Thrang","Sleeps 7"],["Thrang Garth","Sleeps 11"]].map(([n,s],i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",borderRadius:12,padding:"14px 24px",border:"1px solid rgba(255,255,255,0.15)"}}>
                      <div style={{fontSize:15,fontWeight:600,marginBottom:3,fontFamily:FF}}>{n}</div>
                      <div style={{fontSize:12,opacity:0.65,fontFamily:FB}}>{s}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setPage("login")} style={{background:"#fff",color:C.slate800,border:"none",padding:"16px 44px",borderRadius:30,cursor:"pointer",fontSize:16,fontFamily:FF,fontWeight:700,letterSpacing:"0.04em",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
                  Request a Stay →
                </button>
              </div>
            </section>

            {/* Feature strip */}
            <section style={{background:C.white,borderBottom:`1px solid ${C.slate200}`,padding:"36px 24px"}}>
              <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
                {[["🏔️","Direct fell access","Step outside onto some of England's finest walking routes."],["🔑","Private bookings only","Exclusive use — the whole property is yours for your stay."],["🛖","Authentic Lakeland","Original stone walls, oak beams, and wood-burning stoves."]].map(([icon,title,desc])=>(
                  <div key={title} style={{textAlign:"center",padding:"8px 16px"}}>
                    <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.slate700,marginBottom:6,fontFamily:FF}}>{title}</div>
                    <div style={{fontSize:13,color:C.slate400,lineHeight:1.65,fontFamily:FB}}>{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section style={{background:`linear-gradient(135deg, ${C.slate800} 0%, ${C.lake700} 100%)`,padding:"72px 24px",textAlign:"center",color:"#fff"}}>
              <h2 style={{fontSize:36,fontWeight:700,marginBottom:14,letterSpacing:"-0.5px",fontFamily:FF}}>Ready to escape to Langdale?</h2>
              <p style={{fontSize:17,opacity:0.72,marginBottom:36,fontStyle:"italic",fontFamily:FF,maxWidth:460,margin:"0 auto 36px"}}>Use your exclusive access code to check availability and make a request.</p>
              <button onClick={()=>setPage("login")} style={{background:"#fff",color:C.slate800,border:"none",padding:"16px 44px",borderRadius:30,cursor:"pointer",fontSize:16,fontFamily:FF,fontWeight:700}}>
                Access Booking Portal →
              </button>
            </section>
          </div>
        )}

        {/* LOGIN */}
        {page==="login"&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 120px)",padding:"40px 24px"}}>
            <div style={{background:C.white,borderRadius:20,padding:"52px 44px",maxWidth:420,width:"100%",boxShadow:`0 8px 48px rgba(30,42,53,0.12)`,border:`1px solid ${C.slate200}`,textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:C.mist,border:`1px solid ${C.slate200}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 20px"}}>🔒</div>
              <h2 style={{fontSize:26,fontWeight:700,marginBottom:8,color:C.slate800,fontFamily:FF}}>Private Access</h2>
              <p style={{fontSize:14,color:C.slate400,marginBottom:28,lineHeight:1.65,fontFamily:FB}}>Enter the password shared with you to access the booking portal.</p>
              <input type="password" placeholder="Enter access password" value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
                style={{width:"100%",padding:"13px 16px",fontSize:15,border:`2px solid ${C.slate200}`,borderRadius:10,marginBottom:12,fontFamily:FB,color:C.slate800,background:C.fog,outline:"none"}}/>
              {pwError&&<p style={{color:C.err,fontSize:13,marginBottom:10,fontFamily:FB}}>{pwError}</p>}
              <button onClick={login} style={{width:"100%",background:C.lake600,color:"#fff",border:"none",padding:"14px",borderRadius:10,cursor:"pointer",fontSize:16,fontFamily:FF,fontWeight:700,marginBottom:14,boxShadow:`0 3px 16px ${C.lake300}`}}>Enter →</button>
              <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:C.slate400,cursor:"pointer",fontSize:13,fontFamily:FB}}>← Back to home</button>
              <p style={{fontSize:11,color:C.slate300,marginTop:16,fontFamily:FB}}>💡 Demo: <code style={{background:C.fog,padding:"2px 6px",borderRadius:4,color:C.slate600}}>sunshine2024</code></p>
            </div>
          </div>
        )}

        {page==="booking"&&<BookingPage/>}
      </main>

      <footer style={{background:C.slate900,padding:"22px 28px",textAlign:"center"}}>
        <p style={{color:C.slate600,fontSize:13,margin:0,fontFamily:FB}}>© 2026 Thrang · Old Thrang & Thrang Garth · Great Langdale Valley, Lake District</p>
      </footer>
    </div>
  );
}
