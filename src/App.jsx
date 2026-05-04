import { useState, useEffect } from "react";
import imgOldThrang from "./assets/Old Thrang Back.jpg";
import imgThrangGarth from "./assets/Thrang Garth Back.jpg";
import imgFrontBoth from "./assets/Front Both.jpg";

const PROPERTY_IMAGES = { oldThrang: imgOldThrang, thrangGarth: imgThrangGarth };

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4isc3SUKhUmPkpRvQYet5WZ-PYd0An-VbOY6rKyUmRJjCVNbgw-_W9IwPJQc3A1ZN/exec";

/* ─── Heritage colour palette ───────────────────────────────────────────── */
const C = {
  // Warm ink — replaces cold slate
  ink900: "#18130c",
  ink800: "#2a2118",
  ink700: "#3d3529",
  ink600: "#5c5147",
  ink500: "#7a6e5e",
  ink400: "#9a8d7a",
  ink300: "#bdb3a4",
  ink200: "#ddd5c4",
  ink100: "#ede8df",
  ink50:  "#f7f3ed",   // warm parchment

  // Fell green — replaces corporate blue
  fell:   "#3b5c3d",
  fellD:  "#2c4530",
  fellM:  "#527d55",
  fellL:  "#8aab8c",
  fellBg: "#edf2ed",

  // Aged gold — heritage accent
  gold:   "#7a6030",
  goldL:  "#b49040",
  goldBg: "#f7f1e4",

  // Functional
  white:  "#ffffff",
  fog:    "#f2ede5",
  err:    "#7a2c2c",
  errBg:  "#fdf5f0",
  errBorder: "#d4b8b8",
};

const FF = "'Playfair Display', Georgia, serif";
const FB = "'Source Serif 4', Georgia, serif";

const ACCESS_PASSWORD = "sunshine2024";

const PROPERTIES = {
  oldThrang: {
    id: "oldThrang", name: "Old Thrang", sleeps: 7,
    tagline: "A traditional Lakeland farmhouse for up to 7 guests",
    description: "Old Thrang is a beautifully restored Lakeland farmhouse nestled in the Great Langdale Valley. With original stone walls, oak beams, and a wood-burning stove, it blends rustic charm with modern comfort — the perfect retreat for a group looking to escape to the fells.",
    parking: 2,
    bedrooms: [
      { name: "Bedroom 1", beds: "Double bed + 2 single beds" },
      { name: "Bedroom 2", beds: "2 single beds" },
      { name: "Bedroom 3", beds: "1 single bed" },
    ],
    pricing: { winter: 675, summer: 810, weekend: 450 },
  },
  thrangGarth: {
    id: "thrangGarth", name: "Thrang Garth", sleeps: 11,
    tagline: "A spacious Lakeland retreat for up to 11 guests",
    description: "Thrang Garth is a generous, characterful property perfect for larger groups seeking the very best of the Lake District. Set within the stunning Great Langdale Valley, it offers ample space, beautiful interiors, and direct access to some of the finest walking in England.",
    parking: 3,
    bedrooms: [
      { name: "Bedroom 1", beds: "Double bed + cot" },
      { name: "Bedroom 2", beds: "Double bed" },
      { name: "Bedroom 3", beds: "¾ double bed" },
      { name: "Bedroom 4", beds: "5 single beds" },
    ],
    pricing: { winter: 850, summer: 1040, weekend: 500 },
  },
};

const SHARED_AMENITIES = [
  "Free WiFi", "Self-catering kitchen", "Dishwasher", "Microwave",
  "Fridge / freezer", "Television", "Central heating",
  "Large private garden", "Pets welcome", "Exclusive private use",
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function isSameDay(a,b){ return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function isInRange(date,start,end){
  if(!start||!end)return false;
  const n=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x;};
  return n(date)>=n(start)&&n(date)<=n(end);
}
function isBooked(date,ranges){ return ranges.some(r=>isInRange(date,r.start,r.end)); }
function isPending(date,ranges){ return ranges&&ranges.some(r=>isInRange(date,r.start,r.end)); }
function isPast(date){ const t=new Date();t.setHours(0,0,0,0);const d=new Date(date);d.setHours(0,0,0,0);return d<t; }
function formatDate(d){ if(!d)return""; return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }
function nightsBetween(a,b){ if(!a||!b)return 0; return Math.round(Math.abs((b-a)/(1000*60*60*24))); }
function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

/* ─── Thin rule divider ─────────────────────────────────────────────────── */
function Rule({ color=C.ink200, margin="20px 0" }){
  return <div style={{height:1,background:color,margin}}/>;
}

/* ─── Pricing card ──────────────────────────────────────────────────────── */
function PricingCard({ pricing }){
  const tiers=[
    { label:"Winter",  sub:"November – March", price:pricing.winter,  note:"per week"  },
    { label:"Summer",  sub:"April – October",  price:pricing.summer,  note:"per week"  },
    { label:"Weekend", sub:"Friday – Monday",   price:pricing.weekend, note:"per stay"  },
  ];
  return(
    <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"22px 28px",marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:6,marginBottom:18}}>
        <span style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.ink400,fontFamily:FB}}>Rates</span>
        <span style={{fontSize:12,color:C.ink400,fontFamily:FB,fontStyle:"italic"}}>Weekly stays run Saturday to Saturday</span>
      </div>
      <div className="pricing-grid">
        {tiers.map(({label,sub,price,note},i)=>(
          <div key={label} style={{
            padding:"18px 20px",
            background: i===1 ? C.ink50 : C.white,
            borderTop:`2px solid ${i===1 ? C.gold : C.ink200}`,
            borderRight:`1px solid ${C.ink200}`,
            borderBottom:`1px solid ${C.ink200}`,
            borderLeft:`1px solid ${C.ink200}`,
          }}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:i===1?C.gold:C.ink500,marginBottom:3,fontFamily:FB}}>{label}</div>
            <div style={{fontSize:11,color:C.ink400,marginBottom:12,fontFamily:FB}}>{sub}</div>
            <div style={{fontSize:26,fontWeight:600,color:C.ink800,fontFamily:FF,lineHeight:1}}>£{price.toLocaleString()}</div>
            <div style={{fontSize:11,color:C.ink400,marginTop:4,fontFamily:FB}}>{note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Portal property selector ──────────────────────────────────────────── */
function PropertyTabs({ active, setActive }){
  return(
    <div className="prop-btn-group">
      {Object.values(PROPERTIES).map(p=>{
        const sel=active===p.id;
        return(
          <button key={p.id} onClick={()=>setActive(p.id)} style={{
            padding:"9px 22px",
            border:`1px solid ${sel ? C.fell : C.ink200}`,
            borderBottom: sel ? `2px solid ${C.fell}` : `1px solid ${C.ink200}`,
            background: sel ? C.fell : C.white,
            color: sel ? C.white : C.ink600,
            cursor:"pointer",
            fontFamily:FB,
            fontSize:13,
            fontWeight: sel ? 600 : 400,
            letterSpacing:"0.01em",
            transition:"all 0.15s",
          }}>
            {p.name} · Sleeps {p.sleeps}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Portal section heading ────────────────────────────────────────────── */
function SectionHeading({ children }){
  return(
    <div style={{marginBottom:20}}>
      <div style={{width:24,height:2,background:C.gold,marginBottom:10}}/>
      <h1 style={{fontSize:22,fontWeight:600,color:C.ink800,margin:0,fontFamily:FF,letterSpacing:"0.01em"}}>{children}</h1>
    </div>
  );
}

/* ─── Portal header row ─────────────────────────────────────────────────── */
function PortalHeader({ active, setActive, prop }){
  return(
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:16,paddingBottom:20,borderBottom:`1px solid ${C.ink200}`}}>
      <div>
        <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,margin:"0 0 6px",fontFamily:FB}}>Great Langdale Valley · Lake District</p>
        <h1 style={{fontSize:24,fontWeight:600,color:C.ink800,margin:0,fontFamily:FF}}>{prop.name}</h1>
        <p style={{fontSize:13,color:C.ink500,fontStyle:"italic",margin:"4px 0 0",fontFamily:FB}}>{prop.tagline}</p>
      </div>
      <PropertyTabs active={active} setActive={setActive}/>
    </div>
  );
}

/* ─── Calendar ──────────────────────────────────────────────────────────── */
function Calendar({checkIn,checkOut,onSelectDate,hoverDate,onHoverDate,bookedRanges,pendingRanges}){
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
          ?<span key="title" style={{fontSize:15,fontWeight:600,color:C.ink800,letterSpacing:"0.04em",fontFamily:FF}}>{MONTHS[vm]} {vy}</span>
          :<button key={i} onClick={fn} style={{background:"none",border:`1px solid ${C.ink200}`,width:30,height:30,cursor:"pointer",color:C.ink500,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{i===0?"‹":"›"}</button>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:C.ink400,letterSpacing:"0.1em",padding:"4px 0",textTransform:"uppercase"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((date,i)=>{
          if(!date)return<div key={"e"+i}/>;
          const booked=isBooked(date,bookedRanges),past=isPast(date),pending=isPending(date,pendingRanges),dis=booked||past;
          const isStart=checkIn&&isSameDay(date,checkIn),isEnd=checkOut&&isSameDay(date,checkOut);
          const inRng=checkIn&&rangeEnd&&!isSameDay(checkIn,rangeEnd)&&isInRange(date,checkIn<rangeEnd?checkIn:rangeEnd,checkIn<rangeEnd?rangeEnd:checkIn);
          const isTdy=isSameDay(date,today);
          let bg=C.fog,col=C.ink800,cur="pointer",brd="1px solid transparent",fw=400,op=1;
          if(dis){bg=booked?"#f0e8e4":C.ink100;col=booked?"#8b4030":C.ink300;cur="not-allowed";op=booked?1:0.55;}
          else if(isStart||isEnd){bg=C.fell;col="#fff";fw=600;brd=`1px solid ${C.fell}`;}
          else if(inRng){bg:C.fellBg;col:C.fellD;}
          else if(isTdy){brd=`1px solid ${C.fell}`;col=C.fell;fw=600;}
          const isPend=pending&&!dis&&!isStart&&!isEnd&&!inRng;
          return(
            <div key={date.toString()} onClick={()=>!dis&&onSelectDate(date)}
              onMouseEnter={()=>!dis&&onHoverDate(date)} onMouseLeave={()=>onHoverDate(null)}
              style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",background:isPend?C.goldBg:inRng?C.fellBg:bg,color:isPend?C.gold:inRng?C.fellD:col,cursor:cur,border:brd,fontWeight:fw,fontSize:12,position:"relative",transition:"background 0.1s",opacity:op}}>
              {date.getDate()}
              {booked&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:"#8b4030"}}/>}
              {isPend&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:C.gold}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:14,marginTop:14,flexWrap:"wrap"}}>
        {[[C.fog,"Available"],[C.fellBg,"In range"],[C.fell,"Selected"],["#f0e8e4","Unavailable"],[C.goldBg,"Pending"]].map(([bg,label])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:C.ink400}}>
            <div style={{width:10,height:10,background:bg,border:`1px solid ${C.ink200}`}}/>
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
    <div style={{background:filled?C.ink50:C.white,border:`1px solid ${filled?C.ink300:C.ink200}`,padding:"10px 16px",minWidth:130,transition:"all 0.15s"}}>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:C.ink400,fontWeight:600,marginBottom:4,textTransform:"uppercase",fontFamily:FB}}>{label}</div>
      <div style={{fontSize:14,fontWeight:600,color:filled?C.ink800:C.ink300,fontFamily:FB}}>{filled?formatDate(value):"—"}</div>
    </div>
  );
}

/* ─── Booking panel ─────────────────────────────────────────────────────── */
function BookingPanel({property,onBooked,onReset}){
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
    setError("");
    const params=new URLSearchParams({property:property.name,checkIn:checkIn.toISOString(),checkOut:checkOut.toISOString(),nights:String(nights),guestName:form.name,guestEmail:form.email,guestPhone:form.phone||"—",message:form.message||"—"});
    const img=new Image();
    img.src=APPS_SCRIPT_URL+"?"+params.toString();
    onBooked(property.id,checkIn,checkOut);
    setSubmitted(true);
  };
  const reset=()=>{setSubmitted(false);setCheckIn(null);setCheckOut(null);setForm({name:"",email:"",phone:"",message:""});onReset&&onReset();};
  const inp={padding:"11px 13px",border:`1px solid ${C.ink200}`,fontSize:14,fontFamily:FB,color:C.ink800,background:C.white,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.15s"};
  const lbl={fontSize:10,fontWeight:600,color:C.ink500,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:FB,marginBottom:6,display:"block"};
  if(submitted)return(
    <div style={{textAlign:"center",padding:"52px 24px"}}>
      <div style={{width:52,height:52,background:C.fell,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#fff",margin:"0 auto 20px"}}>✓</div>
      <h3 style={{fontSize:22,fontWeight:600,color:C.ink800,marginBottom:10,fontFamily:FF}}>Request Received</h3>
      <p style={{fontSize:14,color:C.ink600,lineHeight:1.8,maxWidth:440,margin:"0 auto 28px",fontFamily:FB}}>
        Thank you, <strong>{form.name}</strong>. Your enquiry for <strong>{property.name}</strong> from <strong>{formatDate(checkIn)}</strong> to <strong>{formatDate(checkOut)}</strong> ({nights} night{nights!==1?"s":""}) has been received. We'll be in touch at <strong>{form.email}</strong>.
      </p>
      <button onClick={reset} style={{background:"none",border:`1px solid ${C.fell}`,color:C.fell,padding:"10px 28px",cursor:"pointer",fontSize:13,fontFamily:FB,letterSpacing:"0.04em"}}>Make Another Request</button>
    </div>
  );
  return(
    <div className="booking-grid">
      {/* Left: calendar */}
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <DateChip label="Check-in"  value={checkIn}/>
          <div style={{color:C.ink300,fontSize:14}}>→</div>
          <DateChip label="Check-out" value={checkOut}/>
          {nights>0&&<div style={{background:C.fellBg,color:C.fell,border:`1px solid ${C.fellL}`,padding:"5px 12px",fontSize:12,fontFamily:FB,letterSpacing:"0.04em"}}>{nights} night{nights!==1?"s":""}</div>}
        </div>
        <p style={{fontSize:11,color:C.ink400,marginBottom:12,fontFamily:FB,fontStyle:"italic"}}>Click a start date, then an end date.</p>
        <div style={{background:C.white,border:`1px solid ${C.ink200}`,padding:16}}>
          <Calendar checkIn={checkIn} checkOut={checkOut} onSelectDate={handleSelect} hoverDate={hover} onHoverDate={setHover} bookedRanges={property.bookedRanges} pendingRanges={property.pendingRanges}/>
        </div>
        {error&&<div style={{background:C.errBg,border:`1px solid ${C.errBorder}`,padding:"10px 14px",fontSize:12,color:C.err,marginTop:12,fontFamily:FB}}>{error}</div>}
      </div>
      {/* Right: form */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <p style={{fontSize:10,fontWeight:600,color:C.ink400,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:FB,margin:0}}>Your Details</p>
        {[{label:"Full Name *",key:"name",type:"text",ph:"Jane Smith"},{label:"Email Address *",key:"email",type:"email",ph:"jane@email.com"},{label:"Phone Number",key:"phone",type:"text",ph:"+44 7700 000000"},{label:"Message",key:"message",type:"area",ph:"Any questions or special requests…"}].map(({label,key,type,ph})=>(
          <div key={key} style={{display:"flex",flexDirection:"column"}}>
            <label style={lbl}>{label}</label>
            {type==="area"?<textarea placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{...inp,height:80,resize:"vertical"}}/>:<input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inp}/>}
          </div>
        ))}
        <button onClick={handleSubmit} style={{background:C.fell,color:"#fff",border:`1px solid ${C.fell}`,padding:"13px 28px",cursor:"pointer",fontSize:14,fontFamily:FF,fontWeight:600,letterSpacing:"0.04em",marginTop:4,transition:"background 0.15s"}}>
          Request Booking →
        </button>
      </div>
    </div>
  );
}

/* ─── Booking page ──────────────────────────────────────────────────────── */
function BookingPage({active,setActive}){
  const [confirmedRanges,setConfirmedRanges]=useState({oldThrang:[],thrangGarth:[]});
  const [pendingRanges,setPendingRanges]=useState({oldThrang:[],thrangGarth:[]});
  const CACHE_KEY="thrang_cal_cache";
  const CACHE_TTL=2*60*1000;
  const applyEvents=(events)=>{
    const confirmed={oldThrang:[],thrangGarth:[]};
    const pending={oldThrang:[],thrangGarth:[]};
    events.forEach(ev=>{
      const range={start:new Date(ev.start),end:new Date(ev.end)};
      const key=ev.title.indexOf("Old Thrang")!==-1?"oldThrang":ev.title.indexOf("Thrang Garth")!==-1?"thrangGarth":null;
      if(!key)return;
      if(ev.status==="confirmed") confirmed[key].push(range);
      else pending[key].push(range);
    });
    setConfirmedRanges(confirmed);setPendingRanges(pending);
  };
  const fetchCalendar=(bust=false)=>{
    try{
      if(!bust){
        const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
        if(cached&&Date.now()-cached.ts<CACHE_TTL){applyEvents(cached.events);return()=>{};}
      }
    }catch(_){}
    const cbName="__gcal_"+Date.now();
    window[cbName]=(events)=>{
      applyEvents(events);
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),events}));}catch(_){}
      delete window[cbName];
    };
    const s=document.createElement("script");
    s.src=APPS_SCRIPT_URL+"?action=getEvents&callback="+cbName;
    s.onerror=()=>delete window[cbName];
    document.head.appendChild(s);
    return()=>{try{document.head.removeChild(s);}catch(_){}};
  };
  useEffect(()=>fetchCalendar(),[active]);
  const p={...PROPERTIES[active],bookedRanges:confirmedRanges[active]||[],pendingRanges:pendingRanges[active]||[]};
  return(
    <div className="booking-portal" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>
      <PricingCard pricing={p.pricing}/>
      <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"28px"}}>
        <BookingPanel key={active} property={p}
          onBooked={(id,s,e)=>setPendingRanges(r=>({...r,[id]:[...r[id],{start:s,end:e}]}))}
          onReset={()=>fetchCalendar(true)}/>
      </div>
    </div>
  );
}

/* ─── Info page ─────────────────────────────────────────────────────────── */
function InfoPage({active,setActive}){
  const p=PROPERTIES[active];
  const rowStyle={display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"10px 0",borderBottom:`1px solid ${C.ink100}`};
  return(
    <div className="booking-portal" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>

      <div className="info-card-grid" style={{marginBottom:20}}>
        {/* Overview */}
        <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"22px 24px"}}>
          <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,margin:"0 0 14px",fontFamily:FB}}>Property Overview</p>
          <Rule color={C.ink100} margin="0 0 4px"/>
          {[
            ["Location","Great Langdale Valley, Lake District"],
            ["Sleeps",String(p.sleeps)],
            ["Bedrooms",String(p.bedrooms.length)],
            ["Parking",`${p.parking} spaces`],
            ["Type","Self-catering holiday let"],
          ].map(([label,value])=>(
            <div key={label} style={rowStyle}>
              <span style={{fontSize:13,color:C.ink500,fontFamily:FB}}>{label}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.ink800,fontFamily:FB,textAlign:"right",maxWidth:"55%"}}>{value}</span>
            </div>
          ))}
        </div>

        {/* Bedrooms */}
        <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"22px 24px"}}>
          <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,margin:"0 0 14px",fontFamily:FB}}>Bedrooms</p>
          <Rule color={C.ink100} margin="0 0 4px"/>
          {p.bedrooms.map((bed,i)=>(
            <div key={i} style={rowStyle}>
              <span style={{fontSize:13,color:C.ink500,fontFamily:FB}}>{bed.name}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.ink800,fontFamily:FB,textAlign:"right",maxWidth:"55%"}}>{bed.beds}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"22px 24px"}}>
        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,margin:"0 0 14px",fontFamily:FB}}>Amenities</p>
        <Rule color={C.ink100} margin="0 0 16px"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:8}}>
          {SHARED_AMENITIES.map(label=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.ink100}`}}>
              <div style={{width:5,height:5,background:C.gold,flexShrink:0}}/>
              <span style={{fontSize:13,color:C.ink700,fontFamily:FB}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Camera icon ───────────────────────────────────────────────────────── */
function CameraIcon({size=26,color="currentColor"}){
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="14" rx="1"/>
      <circle cx="12" cy="13" r="3"/>
      <path d="M8 6l1.5-2h5L16 6"/>
    </svg>
  );
}

/* ─── Gallery page ──────────────────────────────────────────────────────── */
function GalleryPage({active,setActive}){
  const [lightbox,setLightbox]=useState(null);
  const p=PROPERTIES[active];
  const COUNT=12;
  useEffect(()=>{ setLightbox(null); },[active]);
  useEffect(()=>{
    if(lightbox===null)return;
    const h=(e)=>{
      if(e.key==="ArrowRight") setLightbox(i=>(i+1)%COUNT);
      else if(e.key==="ArrowLeft") setLightbox(i=>(i-1+COUNT)%COUNT);
      else if(e.key==="Escape") setLightbox(null);
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[lightbox]);
  return(
    <div className="booking-portal" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>
      <div style={{border:`1px solid ${C.ink200}`,background:C.white,padding:"24px"}}>
        <p style={{fontSize:10,fontWeight:600,color:C.gold,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:FB,margin:"0 0 16px"}}>Photo Gallery — {p.name}</p>
        <Rule color={C.ink100} margin="0 0 18px"/>
        <div style={{overflowY:"auto",maxHeight:560}}>
          <div className="gallery-grid">
            {Array.from({length:COUNT},(_,i)=>(
              <div key={i} onClick={()=>setLightbox(i)}
                style={{aspectRatio:"4/3",background:C.ink50,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,border:`1px solid ${C.ink200}`,color:C.ink300,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.fell;e.currentTarget.style.background=C.ink100;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.ink200;e.currentTarget.style.background=C.ink50;}}>
                <CameraIcon color={C.ink300}/>
                <span style={{fontSize:11,fontFamily:FB,color:C.ink400,letterSpacing:"0.05em"}}>Photo {i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox!==null&&(
        <div onClick={()=>setLightbox(null)}
          style={{position:"fixed",inset:0,background:"rgba(24,19,12,0.95)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <button onClick={()=>setLightbox(null)}
            style={{position:"absolute",top:20,right:24,background:"transparent",border:`1px solid rgba(255,255,255,0.25)`,width:40,height:40,cursor:"pointer",color:"#fff",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ×
          </button>
          <div style={{position:"absolute",top:26,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.45)",fontSize:12,fontFamily:FB,letterSpacing:"0.12em"}}>
            {lightbox+1} / {COUNT}
          </div>
          <button className="lb-prev" onClick={e=>{e.stopPropagation();setLightbox(i=>(i-1+COUNT)%COUNT);}}
            style={{position:"absolute",left:20,background:"transparent",border:`1px solid rgba(255,255,255,0.2)`,width:48,height:48,cursor:"pointer",color:"#fff",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ‹
          </button>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"min(80vw,860px)",aspectRatio:"4/3",background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.08)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
            <CameraIcon size={44} color="rgba(255,255,255,0.15)"/>
            <span style={{fontSize:14,fontFamily:FB,letterSpacing:"0.08em",color:"rgba(255,255,255,0.3)"}}>Photo {lightbox+1} — {p.name}</span>
            <span style={{fontSize:11,fontFamily:FB,color:"rgba(255,255,255,0.18)"}}>Image coming soon</span>
          </div>
          <button className="lb-next" onClick={e=>{e.stopPropagation();setLightbox(i=>(i+1)%COUNT);}}
            style={{position:"absolute",right:20,background:"transparent",border:`1px solid rgba(255,255,255,0.2)`,width:48,height:48,cursor:"pointer",color:"#fff",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────── */
const PORTAL_PAGES=["booking","info","gallery"];

export default function App(){
  const [page,setPage]=useState("home");
  const [homeActive,setHomeActive]=useState("oldThrang");
  const [portalActive,setPortalActive]=useState("oldThrang");
  const [password,setPassword]=useState("");
  const [pwError,setPwError]=useState("");
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{setTimeout(()=>setMounted(true),50);},[]);
  const inPortal=PORTAL_PAGES.includes(page);
  const login=()=>{
    if(password===ACCESS_PASSWORD){setPwError("");setPage("booking");}
    else setPwError("Incorrect password. Please try again.");
  };
  return(
    <div style={{fontFamily:FB,background:C.ink50,minHeight:"100vh",display:"flex",flexDirection:"column",color:C.ink800}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=Montserrat:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;}
        button{transition:opacity 0.12s;}
        button:hover{opacity:0.82;}
        input:focus,textarea:focus{outline:none;border-color:${C.fell}!important;}
        input::placeholder,textarea::placeholder{color:${C.ink300};}
        .booking-portal,.booking-portal *{font-family:'Montserrat',sans-serif!important;}

        /* Responsive layout grids */
        .booking-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;}
        .info-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;}
        .prop-btn-group{display:flex;gap:0;flex-wrap:wrap;}

        @media(max-width:700px){
          .portal-nav-btn{padding:5px 10px!important;font-size:12px!important;}
          .hero-title{font-size:48px!important;letter-spacing:-1px!important;}
          .hero-sub{font-size:15px!important;}
          .hero-section{min-height:380px!important;}
          .showcase-img{height:300px!important;}
          .showcase-text{bottom:16px!important;left:16px!important;right:16px!important;}
          .showcase-text h2{font-size:22px!important;}
          .feature-strip-grid{grid-template-columns:1fr!important;}
          .feature-item{border-left:none!important;padding-top:24px!important;border-top:1px solid ${C.ink200};}
          .feature-item:first-child{border-top:none;}
          .booking-grid{grid-template-columns:1fr!important;gap:24px!important;}
          .pricing-grid{grid-template-columns:1fr!important;}
          .info-card-grid{grid-template-columns:1fr!important;}
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important;}
          .prop-btn-group button{flex:1;min-width:0;}
          .login-card{padding:32px 20px!important;}
          .lb-prev{left:6px!important;}
          .lb-next{right:6px!important;}
          .portal-page{padding:20px 14px!important;}
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{background:C.ink50,borderBottom:`1px solid ${C.ink200}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          {/* Logo */}
          <div onClick={()=>setPage("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,background:C.fell,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:FF,fontSize:15,fontWeight:600}}>T</div>
            <span style={{fontSize:18,fontWeight:600,color:C.ink800,fontFamily:FF,letterSpacing:"0.01em"}}>Thrang</span>
          </div>
          {/* Nav */}
          <nav style={{display:"flex",alignItems:"center",gap:4}}>
            <button onClick={()=>setPage("home")}
              style={{background:"none",border:"none",cursor:"pointer",padding:"6px 12px",fontSize:13,color:page==="home"?C.ink800:C.ink500,fontFamily:FB,fontWeight:page==="home"?600:400,borderBottom:page==="home"?`1px solid ${C.ink800}`:"1px solid transparent"}}>
              Home
            </button>
            {inPortal?(
              <>
                {[["info","Info"],["gallery","Gallery"],["booking","Book"]].map(([pg,label])=>{
                  const isCur=page===pg;
                  return(
                    <button key={pg} onClick={()=>setPage(pg)} className="portal-nav-btn"
                      style={{padding:"6px 14px",background:"none",border:"none",borderBottom:`2px solid ${isCur?C.fell:"transparent"}`,color:isCur?C.fell:C.ink500,cursor:"pointer",fontSize:13,fontFamily:FB,fontWeight:isCur?600:400,transition:"all 0.15s"}}>
                      {label}
                    </button>
                  );
                })}
              </>
            ):(
              <button onClick={()=>setPage("login")}
                style={{background:C.fell,color:"#fff",border:`1px solid ${C.fell}`,padding:"8px 20px",cursor:"pointer",fontSize:13,fontFamily:FB,fontWeight:500,letterSpacing:"0.03em",marginLeft:6}}>
                Book Now
              </button>
            )}
          </nav>
        </div>
      </header>

      <main style={{flex:1}}>
        {/* ── Home ── */}
        {page==="home"&&(
          <div style={{opacity:mounted?1:0,transition:"opacity 0.5s"}}>

            {/* Hero */}
            <section className="hero-section" style={{position:"relative",minHeight:540,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <img src={imgFrontBoth} alt="Thrang" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,rgba(26,20,14,0.76) 0%,rgba(44,69,48,0.52) 100%)"}}/>
              <div style={{position:"relative",textAlign:"center",color:"#fff",padding:"60px 24px",maxWidth:660}}>
                <p style={{fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",opacity:0.7,marginBottom:24,fontFamily:FB}}>Great Langdale Valley · Lake District</p>
                <h1 className="hero-title" style={{fontSize:76,fontWeight:600,margin:"0 0 18px",letterSpacing:"-2px",lineHeight:0.95,fontFamily:FF}}>Thrang</h1>
                <p className="hero-sub" style={{fontSize:17,opacity:0.8,marginBottom:44,fontStyle:"italic",lineHeight:1.65,fontFamily:FF}}>Two exceptional properties in the heart of the Lakeland fells</p>
                <button onClick={()=>setPage("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.6)",padding:"14px 40px",cursor:"pointer",fontSize:14,fontFamily:FF,fontWeight:600,letterSpacing:"0.08em",transition:"background 0.2s"}}>
                  Request a Stay
                </button>
              </div>
            </section>

            {/* Property showcase */}
            <section style={{background:C.white,padding:"64px 24px",borderBottom:`1px solid ${C.ink200}`}}>
              <div style={{maxWidth:1000,margin:"0 auto"}}>
                <div style={{display:"flex",gap:0,marginBottom:36,justifyContent:"center"}}>
                  {Object.values(PROPERTIES).map(prop=>{
                    const sel=homeActive===prop.id;
                    return(
                      <button key={prop.id} onClick={()=>setHomeActive(prop.id)} style={{
                        padding:"10px 32px",
                        border:`1px solid ${C.ink200}`,
                        borderBottom:`2px solid ${sel?C.fell:C.ink200}`,
                        background: sel ? C.ink50 : C.white,
                        color: sel ? C.fell : C.ink500,
                        cursor:"pointer",fontFamily:FF,fontSize:14,fontWeight:sel?600:400,
                        transition:"all 0.15s",
                        marginRight:-1,
                      }}>
                        {prop.name}
                      </button>
                    );
                  })}
                </div>
                <div className="showcase-img" style={{position:"relative",overflow:"hidden",height:480,border:`1px solid ${C.ink200}`}}>
                  <img key={homeActive} src={PROPERTY_IMAGES[homeActive]} alt={PROPERTIES[homeActive].name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(26,20,14,0.86))"}}/>
                  <div className="showcase-text" style={{position:"absolute",bottom:36,left:40,right:40,color:"#fff"}}>
                    <p style={{fontSize:10,letterSpacing:"0.24em",textTransform:"uppercase",opacity:0.6,marginBottom:10,fontFamily:FB}}>Great Langdale Valley · Lake District</p>
                    <h2 style={{fontSize:32,fontWeight:600,margin:"0 0 12px",fontFamily:FF,letterSpacing:"-0.5px"}}>{PROPERTIES[homeActive].name}</h2>
                    <p style={{fontSize:14,opacity:0.82,margin:"0 0 22px",fontFamily:FB,maxWidth:540,lineHeight:1.75}}>{PROPERTIES[homeActive].description}</p>
                    <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                      <span style={{border:"1px solid rgba(255,255,255,0.35)",padding:"6px 16px",fontSize:12,fontFamily:FB,letterSpacing:"0.04em"}}>Sleeps {PROPERTIES[homeActive].sleeps}</span>
                      <button onClick={()=>setPage("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.5)",padding:"8px 24px",cursor:"pointer",fontSize:13,fontFamily:FF,fontWeight:600,letterSpacing:"0.05em"}}>Request a Stay</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature strip */}
            <section style={{background:C.white,borderBottom:`1px solid ${C.ink200}`,padding:"52px 24px"}}>
              <div className="feature-strip-grid" style={{maxWidth:820,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0}}>
                {[
                  ["Direct fell access","Step outside onto some of England's finest walking routes."],
                  ["Private bookings only","Exclusive use — the whole property is yours for your stay."],
                  ["Authentic Lakeland","Original stone walls, oak beams, and wood-burning stoves."],
                ].map(([title,desc],i)=>(
                  <div key={title} className="feature-item" style={{textAlign:"center",padding:"0 36px",borderLeft:i>0?`1px solid ${C.ink200}`:"none"}}>
                    <div style={{width:28,height:1,background:C.gold,margin:"0 auto 18px"}}/>
                    <div style={{fontSize:14,fontWeight:600,color:C.ink800,marginBottom:10,fontFamily:FF,letterSpacing:"0.03em"}}>{title}</div>
                    <div style={{fontSize:13,color:C.ink500,lineHeight:1.75,fontFamily:FB}}>{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section style={{background:C.ink800,padding:"80px 24px",textAlign:"center",color:"#fff"}}>
              <p style={{fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",color:C.goldL,marginBottom:20,fontFamily:FB}}>Exclusive access</p>
              <h2 style={{fontSize:34,fontWeight:600,marginBottom:16,letterSpacing:"-0.5px",fontFamily:FF}}>Ready to escape to Langdale?</h2>
              <p style={{fontSize:16,opacity:0.6,marginBottom:40,fontStyle:"italic",fontFamily:FF,maxWidth:420,margin:"0 auto 40px"}}>Use your exclusive access code to check availability and make a request.</p>
              <button onClick={()=>setPage("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.45)",padding:"14px 40px",cursor:"pointer",fontSize:14,fontFamily:FF,fontWeight:600,letterSpacing:"0.08em"}}>
                Access Booking Portal
              </button>
            </section>
          </div>
        )}

        {/* ── Login ── */}
        {page==="login"&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 120px)",padding:"40px 16px",background:C.ink50}}>
            <div className="login-card" style={{background:C.white,padding:"48px 44px",maxWidth:400,width:"100%",border:`1px solid ${C.ink200}`,textAlign:"center"}}>
              <div style={{width:32,height:1,background:C.gold,margin:"0 auto 28px"}}/>
              <h2 style={{fontSize:24,fontWeight:600,marginBottom:8,color:C.ink800,fontFamily:FF}}>Private Access</h2>
              <p style={{fontSize:13,color:C.ink500,marginBottom:28,lineHeight:1.7,fontFamily:FB}}>Enter the password shared with you to access the booking portal.</p>
              <input type="password" placeholder="Enter access password" value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
                style={{width:"100%",padding:"12px 14px",fontSize:14,border:`1px solid ${C.ink200}`,marginBottom:12,fontFamily:FB,color:C.ink800,background:C.ink50,outline:"none"}}/>
              {pwError&&<p style={{color:C.err,fontSize:13,marginBottom:12,fontFamily:FB}}>{pwError}</p>}
              <button onClick={login} style={{width:"100%",background:C.fell,color:"#fff",border:`1px solid ${C.fell}`,padding:"13px",cursor:"pointer",fontSize:14,fontFamily:FF,fontWeight:600,marginBottom:14,letterSpacing:"0.04em"}}>Enter</button>
              <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:C.ink400,cursor:"pointer",fontSize:12,fontFamily:FB,letterSpacing:"0.04em"}}>← Back to home</button>
              <p style={{fontSize:10,color:C.ink300,marginTop:20,fontFamily:FB,letterSpacing:"0.04em"}}>Access code: <code style={{background:C.ink50,padding:"2px 7px",color:C.ink600,fontFamily:"monospace"}}>{ACCESS_PASSWORD}</code></p>
            </div>
          </div>
        )}

        {page==="booking"&&<BookingPage active={portalActive} setActive={setPortalActive}/>}
        {page==="info"&&<InfoPage active={portalActive} setActive={setPortalActive}/>}
        {page==="gallery"&&<GalleryPage active={portalActive} setActive={setPortalActive}/>}
      </main>

      <footer style={{background:C.ink900,borderTop:`1px solid ${C.ink800}`,padding:"28px 24px",textAlign:"center"}}>
        <p style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.ink600,fontFamily:FB}}>Thrang · Old Thrang &amp; Thrang Garth · Great Langdale Valley, Lake District</p>
      </footer>
    </div>
  );
}
