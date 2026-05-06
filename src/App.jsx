import { useState, useEffect } from "react";
import imgOldThrang from "./assets/Old Thrang Back.jpg";
import imgThrangGarth from "./assets/Thrang Garth Back.jpg";
import imgFrontBoth from "./assets/Front Both.jpg";
import logoThrang from "./assets/Thrang Properties Logo.png";

const oldThrangPhotos = Object.values(import.meta.glob("./assets/Photos/Old Thrang/*.{jpg,jpeg,png,JPG,JPEG,PNG}", { eager: true, query: "?url", import: "default" }));
const thrangGarthPhotos = Object.values(import.meta.glob("./assets/Photos/Thrang Garth/*.{jpg,jpeg,png,JPG,JPEG,PNG}", { eager: true, query: "?url", import: "default" }));
const PROPERTY_PHOTOS = { oldThrang: oldThrangPhotos, thrangGarth: thrangGarthPhotos };

const PROPERTY_IMAGES = { oldThrang: imgOldThrang, thrangGarth: imgThrangGarth };
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHoZPrD6ue8kPhoo_Hu0G5pAomHe9Exrp3lSaBerWiX9RLsKecKp3hp1-egAZXptsVDg/exec";
const API_EVENTS  = "/api/events";
const API_BOOKING = "/api/booking";

/* ─── Colour palette ────────────────────────────────────────────────────── */
const C = {
  main:       "#3A6480",   // Lake District blue — primary brand / interactive
  mainD:      "#2a4a5e",   // darker main — footer / deep backgrounds

  twilight:   "#1c2e3d",   // dark text — headings and body (kept dark for readability)
  indigo:     "#34435E",   // Twilight Indigo — secondary text
  crimson:    "#711009",   // Molten Lava     — heritage accent
  crimsonD:   "#550A07",   // darker crimson
  crimsonBg:  "#FBF0EF",   // crimson tint
  evergreen:  "#082D0F",   // Evergreen       — supporting accent
  frost:      "#A0D2DB",   // Frosted Blue    — light accent / calendar range
  frostBg:    "#EAF4F7",   // frost tint

  // Warm neutrals
  parchment:  "#F6F3EE",   // page background
  linen:      "#EDE8DF",   // light section background
  stone:      "#D4CDC3",   // borders
  warm:       "#9A9186",   // muted text
  sand:       "#C2BAB0",   // lighter borders

  white:      "#FFFFFF",
  err:        "#711009",
  errBg:      "#fdf5f0",
  errBorder:  "#d4b8b8",
};

/* Cinzel              — hero display heading only (monumental, carved-stone quality)
   Cormorant Garamond  — all other headings (historic old-style typeface)
   Crimson Pro         — body text (warm, legible at small sizes)
   Raleway             — portal functional text (clean, slightly aristocratic) */
const FH = "'Cinzel', Georgia, serif";               // hero heading only
const FF = "'Cormorant Garamond', Georgia, serif";   // headings
const FB = "'Crimson Pro', Georgia, serif";           // body

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
function formatDate(d){ if(!d)return""; return d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}); }
function nightsBetween(a,b){ if(!a||!b)return 0; return Math.round(Math.abs((b-a)/(1000*60*60*24))); }
function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Su","Mo","Tu","We","Th","Fr","Sa"];

/* ─── Thin rule ─────────────────────────────────────────────────────────── */
function Rule({ color=C.stone, margin="16px 0" }){
  return <div style={{height:1,background:color,margin}}/>;
}

/* ─── Section label (portal) ────────────────────────────────────────────── */
function PortalLabel({ children }){
  return(
    <div style={{marginBottom:16}}>
      <div style={{width:20,height:2,background:C.crimson,marginBottom:8}}/>
      <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:C.indigo,margin:0,fontFamily:FB}}>{children}</p>
    </div>
  );
}

/* ─── Pricing note (compact) ────────────────────────────────────────────── */
function PricingNote({ pricing }){
  const items=[
    { label:"Winter",  sub:"Nov – Mar",  price:pricing.winter,  note:"/ week" },
    { label:"Summer",  sub:"Apr – Oct",  price:pricing.summer,  note:"/ week" },
    { label:"Weekend", sub:"Fri – Mon",  price:pricing.weekend, note:"/ stay" },
  ];
  return(
    <div style={{borderTop:`1px solid ${C.linen}`,marginTop:24,paddingTop:18,display:"flex",flexWrap:"wrap",alignItems:"baseline",gap:"8px 28px",fontFamily:"inherit"}}>
      <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",color:C.warm}}>Rates</span>
      {items.map(({label,sub,price,note})=>(
        <span key={label} style={{fontSize:13,color:C.indigo}}>
          <span style={{color:C.twilight,fontWeight:600}}>{label}</span>
          <span style={{color:C.warm}}> ({sub})</span>
          <span style={{color:C.twilight}}> £{price.toLocaleString()}</span>
          <span style={{color:C.warm}}> {note}</span>
        </span>
      ))}
      <span style={{fontSize:11,color:C.warm,marginLeft:"auto"}}>Weekly stays: Sat – Sat</span>
    </div>
  );
}

/* ─── Property tabs ─────────────────────────────────────────────────────── */
function PropertyTabs({ active, setActive }){
  return(
    <div className="prop-btn-group">
      {Object.values(PROPERTIES).map(p=>{
        const sel=active===p.id;
        return(
          <button key={p.id} onClick={()=>setActive(p.id)} style={{
            padding:"8px 22px",
            border:`1px solid ${sel ? C.main : C.stone}`,
            borderBottom:`2px solid ${sel ? C.crimson : C.stone}`,
            background: sel ? C.main : C.white,
            color: sel ? C.white : C.indigo,
            cursor:"pointer",
            fontFamily:FB,
            fontSize:14,
            fontWeight: sel ? 600 : 400,
            letterSpacing:"0.02em",
            transition:"all 0.15s",
            marginRight: -1,
          }}>
            {p.name} · Sleeps {p.sleeps}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Portal header ─────────────────────────────────────────────────────── */
function PortalHeader({ active, setActive, prop }){
  return(
    <div style={{marginBottom:24,paddingBottom:20,borderBottom:`1px solid ${C.stone}`}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <p style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:C.crimson,margin:"0 0 6px",fontFamily:FB}}>Great Langdale Valley · Lake District</p>
          <h1 style={{fontSize:26,fontWeight:500,color:C.twilight,margin:"0 0 4px",fontFamily:FF,letterSpacing:"0.01em"}}>{prop.name}</h1>
          <p style={{fontSize:14,color:C.warm,margin:0,fontFamily:FB}}>{prop.tagline}</p>
        </div>
        <PropertyTabs active={active} setActive={setActive}/>
      </div>
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
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        {[prevM,"",nextM].map((fn,i)=>i===1
          ?<span key="t" style={{fontSize:15,fontWeight:500,color:C.twilight,letterSpacing:"0.03em",fontFamily:FF}}>{MONTHS[vm]} {vy}</span>
          :<button key={i} onClick={fn} style={{background:"none",border:`1px solid ${C.stone}`,width:28,height:28,cursor:"pointer",color:C.indigo,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{i===0?"‹":"›"}</button>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:C.warm,letterSpacing:"0.1em",padding:"3px 0",textTransform:"uppercase",fontFamily:FB}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((date,i)=>{
          if(!date)return<div key={"e"+i}/>;
          const booked=isBooked(date,bookedRanges),past=isPast(date),pend=isPending(date,pendingRanges),dis=booked||past;
          const isStart=checkIn&&isSameDay(date,checkIn),isEnd=checkOut&&isSameDay(date,checkOut);
          const inRng=checkIn&&rangeEnd&&!isSameDay(checkIn,rangeEnd)&&isInRange(date,checkIn<rangeEnd?checkIn:rangeEnd,checkIn<rangeEnd?rangeEnd:checkIn);
          const isTdy=isSameDay(date,today);
          const isPend=pend&&!dis&&!isStart&&!isEnd&&!inRng;
          let bg=C.parchment,col=C.twilight,cur="pointer",brd="1px solid transparent",fw=400,op=1;
          if(dis){bg=booked?"#f0e8e6":C.linen;col=booked?"#8b3a2a":C.warm;cur="not-allowed";op=booked?1:0.5;}
          else if(isStart||isEnd){bg=C.crimson;col="#fff";fw=600;brd=`1px solid ${C.crimson}`;}
          else if(inRng){bg=C.frostBg;col=C.twilight;}
          else if(isTdy){brd=`1px solid ${C.crimson}`;col=C.crimson;fw=600;}
          if(isPend){bg=C.crimsonBg;col=C.crimson;}
          return(
            <div key={date.toString()} onClick={()=>!dis&&onSelectDate(date)}
              onMouseEnter={()=>!dis&&onHoverDate(date)} onMouseLeave={()=>onHoverDate(null)}
              style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",background:bg,color:col,cursor:cur,border:brd,fontWeight:fw,fontSize:12,position:"relative",transition:"background 0.1s",opacity:op,fontFamily:FB}}>
              {date.getDate()}
              {booked&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:"#8b3a2a"}}/>}
              {isPend&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:C.crimson}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:14,flexWrap:"wrap"}}>
        {[[C.parchment,"Available"],[C.frostBg,"In range"],[C.crimson,"Selected"],["#f0e8e6","Unavailable"],[C.crimsonBg,"Pending"]].map(([bg,label])=>(
          <div key={label} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:C.warm,fontFamily:FB}}>
            <div style={{width:10,height:10,background:bg,border:`1px solid ${C.stone}`}}/>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Date chip ─────────────────────────────────────────────────────────── */
function DateChip({label,value}){
  const filled=!!value;
  return(
    <div style={{background:filled?C.frostBg:C.white,border:`1px solid ${filled?C.frost:C.stone}`,padding:"10px 16px",minWidth:138,transition:"all 0.15s"}}>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:C.warm,fontWeight:600,marginBottom:4,textTransform:"uppercase",fontFamily:FB}}>{label}</div>
      <div style={{fontSize:13,fontWeight:600,color:filled?C.twilight:C.sand,fontFamily:FB}}>{filled?formatDate(value):"—"}</div>
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
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())){setError("Please enter a valid email address (e.g. jane@email.com).");return;}
    setError("");
    const params=new URLSearchParams({property:property.name,checkIn:checkIn.toISOString(),checkOut:checkOut.toISOString(),nights:String(nights),guestName:form.name,guestEmail:form.email,guestPhone:form.phone||"—",message:form.message||"—"});
    const sent=navigator.sendBeacon&&navigator.sendBeacon(API_BOOKING,params);
    if(!sent) fetch(API_BOOKING,{method:"POST",body:params}).catch(()=>{});
    onBooked(property.id,checkIn,checkOut);setSubmitted(true);
  };
  const reset=()=>{setSubmitted(false);setCheckIn(null);setCheckOut(null);setForm({name:"",email:"",phone:"",message:""});onReset&&onReset();};
  const inp={padding:"11px 13px",border:`1px solid ${C.stone}`,fontSize:14,color:C.twilight,background:C.white,outline:"none",width:"100%",boxSizing:"border-box",transition:"border-color 0.15s",fontFamily:"inherit"};
  const lbl={fontSize:10,fontWeight:600,color:C.indigo,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:6,display:"block",fontFamily:"inherit"};
  if(submitted)return(
    <div style={{textAlign:"center",padding:"52px 24px"}}>
      <div style={{width:48,height:48,background:C.evergreen,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",margin:"0 auto 20px"}}>✓</div>
      <h3 style={{fontSize:24,fontWeight:500,color:C.twilight,marginBottom:12,fontFamily:FF}}>Request Received</h3>
      <p style={{fontSize:15,color:C.indigo,lineHeight:1.8,maxWidth:440,margin:"0 auto 28px",fontFamily:FB}}>
        Thank you, <strong>{form.name}</strong>. Your enquiry for <strong>{property.name}</strong> from <strong>{formatDate(checkIn)}</strong> to <strong>{formatDate(checkOut)}</strong> ({nights} night{nights!==1?"s":""}) has been received. We'll be in touch at <strong>{form.email}</strong>.
      </p>
      <button onClick={reset} style={{background:"none",border:`1px solid ${C.crimson}`,color:C.crimson,padding:"10px 28px",cursor:"pointer",fontSize:13,fontFamily:"inherit",letterSpacing:"0.06em"}}>Make Another Request</button>
    </div>
  );
  return(
    <div className="booking-grid">
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <DateChip label="Check-in" value={checkIn}/>
          <div style={{color:C.stone,fontSize:14}}>→</div>
          <DateChip label="Check-out" value={checkOut}/>
          {nights>0&&<div style={{background:C.frostBg,color:C.twilight,border:`1px solid ${C.frost}`,padding:"5px 12px",fontSize:12,fontFamily:"inherit",letterSpacing:"0.04em"}}>{nights} night{nights!==1?"s":""}</div>}
        </div>
        <p style={{fontSize:12,color:C.warm,marginBottom:12,fontFamily:"inherit"}}>Select a check-in date, then a check-out date.</p>
        <div style={{background:C.white,border:`1px solid ${C.stone}`,padding:16}}>
          <Calendar checkIn={checkIn} checkOut={checkOut} onSelectDate={handleSelect} hoverDate={hover} onHoverDate={setHover} bookedRanges={property.bookedRanges} pendingRanges={property.pendingRanges}/>
        </div>
        {error&&<div style={{background:C.errBg,border:`1px solid ${C.errBorder}`,padding:"10px 14px",fontSize:12,color:C.err,marginTop:12,fontFamily:"inherit"}}>{error}</div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <PortalLabel>Your Details</PortalLabel>
        {[{label:"Full Name *",key:"name",type:"text",ph:"Jane Smith"},{label:"Email Address *",key:"email",type:"email",ph:"jane@email.com"},{label:"Phone Number",key:"phone",type:"text",ph:"+44 7700 000000"},{label:"Message",key:"message",type:"area",ph:"Any questions or special requests…"}].map(({label,key,type,ph})=>(
          <div key={key}>
            <label style={lbl}>{label}</label>
            {type==="area"?<textarea placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{...inp,height:80,resize:"vertical"}}/>:<input type={type} placeholder={ph} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={inp}/>}
          </div>
        ))}
        <button onClick={handleSubmit} style={{background:C.main,color:"#fff",border:`1px solid ${C.main}`,padding:"13px 28px",cursor:"pointer",fontSize:14,fontFamily:"inherit",fontWeight:600,letterSpacing:"0.06em",marginTop:4,transition:"background 0.15s"}}>
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
  const CACHE_KEY="thrang_cal_cache",CACHE_TTL=2*60*1000;
  const applyEvents=(events)=>{
    const confirmed={oldThrang:[],thrangGarth:[]},pending={oldThrang:[],thrangGarth:[]};
    events.forEach(ev=>{
      const range={start:new Date(ev.start),end:new Date(ev.end)};
      let key=ev.property;
      if(!key){
        const t=ev.title||"";
        key=t.indexOf("Old Thrang")!==-1?"oldThrang":t.indexOf("Thrang Garth")!==-1?"thrangGarth":null;
      }
      if(!key||!confirmed[key])return;
      (ev.status==="confirmed"?confirmed:pending)[key].push(range);
    });
    setConfirmedRanges(confirmed);setPendingRanges(pending);
  };
  const fetchCalendar=(bust=false)=>{
    try{if(!bust){const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(cached&&Date.now()-cached.ts<CACHE_TTL){applyEvents(cached.events);return()=>{};} }}catch(_){}
    const ctrl=new AbortController();
    fetch(API_EVENTS,{signal:ctrl.signal})
      .then(r=>r.json())
      .then(events=>{applyEvents(events);try{localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),events}));}catch(_){}})
      .catch(()=>{});
    return()=>ctrl.abort();
  };
  useEffect(()=>fetchCalendar(),[active]);
  // Live sync: refetch on tab focus, and every 60s while visible
  useEffect(()=>{
    const POLL_MS=60*1000;
    let timer=null;
    const start=()=>{stop();timer=setInterval(()=>{if(document.visibilityState==="visible")fetchCalendar(true);},POLL_MS);};
    const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
    const onVis=()=>{if(document.visibilityState==="visible"){fetchCalendar(true);start();}else{stop();}};
    if(document.visibilityState==="visible")start();
    document.addEventListener("visibilitychange",onVis);
    window.addEventListener("focus",onVis);
    return()=>{stop();document.removeEventListener("visibilitychange",onVis);window.removeEventListener("focus",onVis);};
  },[]);
  const p={...PROPERTIES[active],bookedRanges:confirmedRanges[active]||[],pendingRanges:pendingRanges[active]||[]};
  return(
    <div className="booking-portal portal-page" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>
      <div style={{border:`1px solid ${C.stone}`,background:C.white,padding:"28px"}}>
        <BookingPanel key={active} property={p}
          onBooked={(id,s,e)=>setPendingRanges(r=>({...r,[id]:[...r[id],{start:s,end:e}]}))}
          onReset={()=>fetchCalendar(true)}/>
        <PricingNote pricing={p.pricing}/>
      </div>
    </div>
  );
}

/* ─── Info page ─────────────────────────────────────────────────────────── */
function InfoPage({active,setActive}){
  const p=PROPERTIES[active];
  const row={display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"9px 0",borderBottom:`1px solid ${C.linen}`};
  return(
    <div className="booking-portal portal-page" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>
      <div className="info-card-grid" style={{marginBottom:16}}>
        <div style={{border:`1px solid ${C.stone}`,background:C.white,padding:"22px 24px"}}>
          <PortalLabel>Property Overview</PortalLabel>
          {[["Location","Great Langdale Valley, Lake District"],["Sleeps",String(p.sleeps)],["Bedrooms",String(p.bedrooms.length)],["Parking",`${p.parking} spaces`],["Type","Self-catering holiday let"]].map(([label,value])=>(
            <div key={label} style={row}>
              <span style={{fontSize:14,color:C.warm,fontFamily:"inherit"}}>{label}</span>
              <span style={{fontSize:14,fontWeight:600,color:C.twilight,fontFamily:"inherit",textAlign:"right",maxWidth:"55%"}}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{border:`1px solid ${C.stone}`,background:C.white,padding:"22px 24px"}}>
          <PortalLabel>Bedrooms</PortalLabel>
          {p.bedrooms.map((bed,i)=>(
            <div key={i} style={row}>
              <span style={{fontSize:14,color:C.warm,fontFamily:"inherit"}}>{bed.name}</span>
              <span style={{fontSize:14,fontWeight:600,color:C.twilight,fontFamily:"inherit",textAlign:"right",maxWidth:"55%"}}>{bed.beds}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{border:`1px solid ${C.stone}`,background:C.white,padding:"22px 24px"}}>
        <PortalLabel>Amenities</PortalLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:0}}>
          {SHARED_AMENITIES.map(label=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.linen}`}}>
              <div style={{width:4,height:4,background:C.crimson,flexShrink:0}}/>
              <span style={{fontSize:14,color:C.indigo,fontFamily:"inherit"}}>{label}</span>
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
      <rect x="3" y="6" width="18" height="14" rx="1"/><circle cx="12" cy="13" r="3"/><path d="M8 6l1.5-2h5L16 6"/>
    </svg>
  );
}

/* ─── Gallery page ──────────────────────────────────────────────────────── */
function GalleryPage({active,setActive}){
  const [lightbox,setLightbox]=useState(null);
  const p=PROPERTIES[active];
  const photos=PROPERTY_PHOTOS[active]||[];
  const COUNT=photos.length;
  useEffect(()=>{setLightbox(null);},[active]);
  useEffect(()=>{
    if(lightbox===null||COUNT===0)return;
    const h=(e)=>{
      if(e.key==="ArrowRight")setLightbox(i=>(i+1)%COUNT);
      else if(e.key==="ArrowLeft")setLightbox(i=>(i-1+COUNT)%COUNT);
      else if(e.key==="Escape")setLightbox(null);
    };
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[lightbox,COUNT]);
  return(
    <div className="booking-portal portal-page" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <PortalHeader active={active} setActive={setActive} prop={p}/>
      <div style={{border:`1px solid ${C.stone}`,background:C.white,padding:"24px"}}>
        <PortalLabel>Photo Gallery — {p.name}</PortalLabel>
        <div style={{overflowY:"auto",maxHeight:640}}>
          <div className="gallery-grid">
            {photos.map((src,i)=>(
              <div key={src} onClick={()=>setLightbox(i)}
                style={{aspectRatio:"4/3",background:C.parchment,border:`1px solid ${C.stone}`,cursor:"pointer",transition:"all 0.15s",overflow:"hidden",position:"relative"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.crimson;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.stone;}}>
                <img src={src} alt={`${p.name} photo ${i+1}`} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              </div>
            ))}
            {COUNT===0&&(
              <div style={{gridColumn:"1 / -1",padding:"40px",textAlign:"center",color:C.warm,fontFamily:"inherit"}}>No photos available yet.</div>
            )}
          </div>
        </div>
      </div>
      {lightbox!==null&&photos[lightbox]&&(
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"rgba(28,46,61,0.96)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <button onClick={()=>setLightbox(null)} style={{position:"absolute",top:20,right:24,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",width:40,height:40,cursor:"pointer",color:"#fff",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          <div style={{position:"absolute",top:26,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.4)",fontSize:12,fontFamily:FB,letterSpacing:"0.14em"}}>{lightbox+1} / {COUNT}</div>
          <button className="lb-prev" onClick={e=>{e.stopPropagation();setLightbox(i=>(i-1+COUNT)%COUNT);}} style={{position:"absolute",left:20,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",width:48,height:48,cursor:"pointer",color:"#fff",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <img onClick={e=>e.stopPropagation()} src={photos[lightbox]} alt={`${p.name} photo ${lightbox+1}`}
            style={{maxWidth:"90vw",maxHeight:"85vh",objectFit:"contain",display:"block"}}/>
          <button className="lb-next" onClick={e=>{e.stopPropagation();setLightbox(i=>(i+1)%COUNT);}} style={{position:"absolute",right:20,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",width:48,height:48,cursor:"pointer",color:"#fff",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
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
  const navigate=(p)=>{ window.history.pushState({page:p},"",""); setPage(p); };
  const login=()=>{
    if(password===ACCESS_PASSWORD){setPwError("");navigate("booking");}
    else setPwError("Incorrect password. Please try again.");
  };
  useEffect(()=>{
    window.history.replaceState({page:"home"},"","");
    const onPop=(e)=>setPage(e.state?.page||"home");
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  return(
    <div style={{fontFamily:FB,background:C.parchment,minHeight:"100vh",display:"flex",flexDirection:"column",color:C.twilight}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:wght@400;500;600&family=Crimson+Pro:wght@300;400;600&family=Raleway:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;}
        button{transition:opacity 0.12s;cursor:pointer;}
        button:hover{opacity:0.82;}
        input:focus,textarea:focus{outline:none;border-color:${C.crimson}!important;}
        input::placeholder,textarea::placeholder{color:${C.sand};}

        /* Portal uses Raleway for functional readability */
        .booking-portal,.booking-portal *{font-family:'Raleway',sans-serif!important;}

        /* Layout grids */
        .booking-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;}
        .info-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;}
        .prop-btn-group{display:flex;gap:0;flex-wrap:wrap;}

        /* Mobile */
        @media(max-width:700px){
          .portal-nav-btn{padding:5px 9px!important;font-size:12px!important;}
          .hero-title{font-size:50px!important;letter-spacing:-1px!important;}
          .hero-sub{font-size:15px!important;}
          .hero-section{min-height:380px!important;}
          .showcase-img{height:300px!important;}
          .showcase-text{bottom:14px!important;left:14px!important;right:14px!important;}
          .showcase-text h2{font-size:22px!important;}
          .feature-strip-grid{grid-template-columns:1fr!important;}
          .feature-item{border-left:none!important;padding-top:24px!important;border-top:1px solid ${C.stone};}
          .feature-item:first-child{border-top:none;}
          .booking-grid{grid-template-columns:1fr!important;gap:24px!important;}
          .pricing-grid{grid-template-columns:1fr!important;}
          .info-card-grid{grid-template-columns:1fr!important;}
          .gallery-grid{grid-template-columns:repeat(2,1fr)!important;}
          .prop-btn-group button{flex:1;min-width:0;}
          .login-card{padding:32px 18px!important;}
          .lb-prev{left:6px!important;}
          .lb-next{right:6px!important;}
          .portal-page{padding:18px 14px!important;}
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{background:C.parchment,borderBottom:`1px solid ${C.stone}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div onClick={()=>navigate("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <img src={logoThrang} alt="Thrang Properties" style={{height:46,width:"auto",display:"block",flexShrink:0}}/>
            <span style={{fontSize:19,fontWeight:500,color:C.twilight,fontFamily:FF,letterSpacing:"0.02em"}}>Thrang Properties</span>
          </div>
          <nav style={{display:"flex",alignItems:"center",gap:2}}>
            <button onClick={()=>navigate("home")} style={{background:"none",border:"none",padding:"6px 12px",fontSize:13,color:page==="home"?C.twilight:C.indigo,fontFamily:FB,fontWeight:page==="home"?600:400,borderBottom:`1.5px solid ${page==="home"?C.crimson:"transparent"}`,paddingBottom:4}}>
              Home
            </button>
            {inPortal?(
              <>
                {[["info","Info"],["gallery","Gallery"],["booking","Book"]].map(([pg,label])=>{
                  const cur=page===pg;
                  return(
                    <button key={pg} onClick={()=>navigate(pg)} className="portal-nav-btn"
                      style={{padding:"6px 12px",paddingBottom:4,background:"none",border:"none",borderBottom:`1.5px solid ${cur?C.crimson:"transparent"}`,color:cur?C.crimson:C.indigo,fontSize:13,fontFamily:FB,fontWeight:cur?600:400,transition:"all 0.12s"}}>
                      {label}
                    </button>
                  );
                })}
              </>
            ):(
              <button onClick={()=>navigate("login")} style={{background:C.main,color:"#fff",border:`1px solid ${C.main}`,padding:"7px 20px",fontSize:13,fontFamily:FB,fontWeight:500,letterSpacing:"0.04em",marginLeft:8}}>
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
            <section className="hero-section" style={{position:"relative",minHeight:560,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <img src={imgFrontBoth} alt="Thrang" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,rgba(42,74,94,0.82) 0%,rgba(8,45,15,0.52) 100%)"}}/>
              <div style={{position:"relative",textAlign:"center",color:"#fff",padding:"60px 24px",maxWidth:620}}>
                <p style={{fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:C.frost,opacity:0.85,marginBottom:22,fontFamily:FB}}>Great Langdale Valley · Lake District</p>
                <h1 className="hero-title" style={{fontSize:62,fontWeight:400,margin:"0 0 18px",letterSpacing:"0.12em",lineHeight:1.05,fontFamily:FH}}>Thrang Properties</h1>
                <p className="hero-sub" style={{fontSize:17,opacity:0.78,marginBottom:48,lineHeight:1.7,fontFamily:FB,fontWeight:300}}>Two exceptional properties in the heart of the Lakeland fells</p>
                <button onClick={()=>navigate("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.5)",padding:"13px 40px",fontSize:13,fontFamily:FB,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",transition:"background 0.2s"}}>
                  Request a Stay
                </button>
              </div>
            </section>

            {/* Property showcase */}
            <section style={{background:C.white,padding:"64px 24px",borderBottom:`1px solid ${C.stone}`}}>
              <div style={{maxWidth:1000,margin:"0 auto"}}>
                <div style={{display:"flex",gap:0,marginBottom:36,justifyContent:"center"}}>
                  {Object.values(PROPERTIES).map(prop=>{
                    const sel=homeActive===prop.id;
                    return(
                      <button key={prop.id} onClick={()=>setHomeActive(prop.id)} style={{padding:"9px 32px",border:`1px solid ${C.stone}`,borderBottom:`2px solid ${sel?C.crimson:C.stone}`,background:sel?C.parchment:C.white,color:sel?C.crimson:C.indigo,fontFamily:FF,fontSize:15,fontWeight:sel?500:400,transition:"all 0.15s",marginRight:-1}}>
                        {prop.name}
                      </button>
                    );
                  })}
                </div>
                <div className="showcase-img" style={{position:"relative",overflow:"hidden",height:480,border:`1px solid ${C.stone}`}}>
                  <img key={homeActive} src={PROPERTY_IMAGES[homeActive]} alt={PROPERTIES[homeActive].name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 28%,rgba(42,74,94,0.90))"}}/>
                  <div className="showcase-text" style={{position:"absolute",bottom:36,left:40,right:40,color:"#fff"}}>
                    <p style={{fontSize:10,letterSpacing:"0.26em",textTransform:"uppercase",color:C.frost,opacity:0.8,marginBottom:10,fontFamily:FB}}>Great Langdale Valley · Lake District</p>
                    <h2 style={{fontSize:32,fontWeight:400,margin:"0 0 12px",fontFamily:FF,letterSpacing:"0.01em"}}>{PROPERTIES[homeActive].name}</h2>
                    <p style={{fontSize:14,opacity:0.8,margin:"0 0 22px",fontFamily:FB,fontWeight:300,maxWidth:520,lineHeight:1.8}}>{PROPERTIES[homeActive].description}</p>
                    <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                      <span style={{border:"1px solid rgba(160,210,219,0.45)",padding:"5px 16px",fontSize:12,fontFamily:FB,letterSpacing:"0.06em",color:C.frost}}>Sleeps {PROPERTIES[homeActive].sleeps}</span>
                      <button onClick={()=>navigate("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.45)",padding:"7px 22px",fontSize:12,fontFamily:FB,fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase"}}>Request a Stay</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature strip */}
            <section style={{background:C.white,borderBottom:`1px solid ${C.stone}`,padding:"52px 24px"}}>
              <div className="feature-strip-grid" style={{maxWidth:820,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
                {[["Direct fell access","Step outside onto some of England's finest walking routes."],["Private bookings only","Exclusive use — the whole property is yours for your stay."],["Authentic Lakeland","Original stone walls, oak beams, and wood-burning stoves."]].map(([title,desc],i)=>(
                  <div key={title} className="feature-item" style={{textAlign:"center",padding:"0 36px",borderLeft:i>0?`1px solid ${C.stone}`:"none"}}>
                    <div style={{width:24,height:1,background:C.crimson,margin:"0 auto 18px"}}/>
                    <div style={{fontSize:15,fontWeight:500,color:C.twilight,marginBottom:10,fontFamily:FF,letterSpacing:"0.02em"}}>{title}</div>
                    <div style={{fontSize:14,color:C.warm,lineHeight:1.8,fontFamily:FB,fontWeight:300}}>{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section style={{background:C.mainD,padding:"84px 24px",textAlign:"center",color:"#fff"}}>
              <p style={{fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:C.frost,marginBottom:20,fontFamily:FB,opacity:0.8}}>Exclusive access</p>
              <h2 style={{fontSize:36,fontWeight:400,marginBottom:16,fontFamily:FF,letterSpacing:"-0.5px"}}>Ready to escape to Langdale?</h2>
              <p style={{fontSize:15,opacity:0.55,marginBottom:44,fontFamily:FB,fontWeight:300,maxWidth:400,margin:"0 auto 44px",lineHeight:1.8}}>Use your exclusive access code to check availability and make a request.</p>
              <button onClick={()=>navigate("login")} style={{background:"transparent",color:"#fff",border:"1px solid rgba(160,210,219,0.45)",padding:"13px 40px",fontSize:13,fontFamily:FB,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase"}}>
                Access Booking Portal
              </button>
            </section>
          </div>
        )}

        {/* ── Login ── */}
        {page==="login"&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 120px)",padding:"40px 16px",background:C.parchment}}>
            <div className="login-card" style={{background:C.white,padding:"48px 44px",maxWidth:400,width:"100%",border:`1px solid ${C.stone}`,textAlign:"center"}}>
              <div style={{width:24,height:1,background:C.crimson,margin:"0 auto 28px"}}/>
              <h2 style={{fontSize:26,fontWeight:400,marginBottom:8,color:C.twilight,fontFamily:FF}}>Private Access</h2>
              <p style={{fontSize:14,color:C.warm,marginBottom:28,lineHeight:1.75,fontFamily:FB,fontWeight:300}}>Enter the password shared with you to access the booking portal.</p>
              <input type="password" placeholder="Enter access password" value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
                style={{width:"100%",padding:"12px 14px",fontSize:14,border:`1px solid ${C.stone}`,marginBottom:12,fontFamily:FB,color:C.twilight,background:C.parchment,outline:"none"}}/>
              {pwError&&<p style={{color:C.err,fontSize:13,marginBottom:12,fontFamily:FB}}>{pwError}</p>}
              <button onClick={login} style={{width:"100%",background:C.main,color:"#fff",border:`1px solid ${C.main}`,padding:"13px",fontSize:14,fontFamily:FB,fontWeight:500,marginBottom:14,letterSpacing:"0.06em"}}>
                Enter
              </button>
              <button onClick={()=>navigate("home")} style={{background:"none",border:"none",color:C.warm,fontSize:12,fontFamily:FB,letterSpacing:"0.04em"}}>← Back to home</button>
              <p style={{fontSize:10,color:C.sand,marginTop:20,fontFamily:FB,letterSpacing:"0.04em"}}>Access code: <code style={{background:C.parchment,padding:"2px 7px",color:C.indigo,fontFamily:"monospace"}}>{ACCESS_PASSWORD}</code></p>
            </div>
          </div>
        )}

        {page==="booking"&&<BookingPage active={portalActive} setActive={setPortalActive}/>}
        {page==="info"&&<InfoPage active={portalActive} setActive={setPortalActive}/>}
        {page==="gallery"&&<GalleryPage active={portalActive} setActive={setPortalActive}/>}
      </main>

      <footer style={{background:C.mainD,borderTop:`1px solid rgba(255,255,255,0.08)`,padding:"28px 24px",textAlign:"center"}}>
        <p style={{fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:FB}}>Thrang · Old Thrang &amp; Thrang Garth · Great Langdale Valley, Lake District</p>
      </footer>
    </div>
  );
}