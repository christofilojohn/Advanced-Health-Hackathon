import { useState, useEffect, useRef } from "react";

const MENTAL_HEALTH_INDICATORS = {
  depression: {
    keywords: ["depressed","hopeless","worthless","empty","numb","no motivation","don't care anymore","nothing matters","tired all the time","no energy","hate myself","crying","no point","giving up","lost interest","don't enjoy","sad all the time","feel like a burden","no purpose"],
    description: "Persistent sadness, loss of interest, or hopelessness",
    color: "#5B6ABF",
  },
  anxiety: {
    keywords: ["anxious","worried","panic","can't breathe","heart racing","nervous","overthinking","restless","on edge","dread","can't stop thinking","fear","stressed","tense","something bad will happen","can't relax","racing thoughts","sweating","shaking","chest tight"],
    description: "Excessive worry, panic, or physical anxiety symptoms",
    color: "#D4A03C",
  },
  social_anxiety: {
    keywords: ["scared of people","afraid to talk","embarrassed","judging me","avoid people","don't want to go out","hate social","can't speak up","shy","humiliated","people stare","afraid of embarrassment","avoid parties","can't make eye contact","scared to speak"],
    description: "Fear or avoidance of social situations",
    color: "#7B8F3C",
  },
  loneliness: {
    keywords: ["lonely","alone","no friends","no one cares","isolated","nobody talks to me","left out","abandoned","disconnected","no one understands","invisible","excluded","no support","all by myself","no one to talk to"],
    description: "Social isolation or feeling disconnected",
    color: "#3C8F8F",
  },
  stress_burnout: {
    keywords: ["burned out","overwhelmed","too much pressure","can't cope","exhausted","breaking point","can't handle","overworked","no work life balance","drowning","falling apart","stretched thin","can't keep up"],
    description: "Chronic stress or occupational burnout",
    color: "#BF5B5B",
  },
  grief_loss: {
    keywords: ["lost someone","grief","mourning","passed away","died","miss them","can't move on","death","funeral","never coming back","heartbroken","devastated"],
    description: "Grief or bereavement",
    color: "#8B6BAF",
  },
  ptsd_trauma: {
    keywords: ["flashback","nightmare","trauma","can't forget","triggered","hypervigilant","startle","abuse","assault","accident","haunted","reliving","night terrors","intrusive thoughts"],
    description: "Trauma-related distress",
    color: "#AF6B4F",
  },
};

const GP_DATABASE = [
  { name:"Dr. Sarah Mitchell", county:"Dublin", practice:"Merrion Square Medical Centre", lat:53.3398, lon:-6.2468, address:"45 Merrion Square East, Dublin 2", phone:"+353-1-676-1234", email:"reception@merrionsquaremc.ie" },
  { name:"Dr. James O'Connor", county:"Dublin", practice:"Grafton Medical Practice", lat:53.3418, lon:-6.2624, address:"12 Aungier Street, Dublin 2", phone:"+353-1-478-5678", email:"info@graftonmedical.ie" },
  { name:"Dr. Aoife Kelly", county:"Dublin", practice:"Clontarf Family Practice", lat:53.3647, lon:-6.1778, address:"9 Clontarf Road, Dublin 3", phone:"+353-1-833-2345", email:"appointments@clontarffp.ie" },
  { name:"Dr. Fiona Walsh", county:"Cork", practice:"South Mall Medical Centre", lat:51.8979, lon:-8.4691, address:"22 South Mall, Cork City", phone:"+353-21-427-1234", email:"reception@southmallmc.ie" },
  { name:"Dr. Patrick Doyle", county:"Cork", practice:"Douglas Village Surgery", lat:51.8768, lon:-8.4352, address:"5 Douglas Village, Cork", phone:"+353-21-489-5678", email:"info@douglassurgery.ie" },
  { name:"Dr. Ciara Murphy", county:"Cork", practice:"Bandon Health Centre", lat:51.7452, lon:-8.7413, address:"Main Street, Bandon, Co. Cork", phone:"+353-23-882-2345", email:"bandonhc@eircom.net" },
  { name:"Dr. Roisin McCarthy", county:"Galway", practice:"Eyre Square Medical Practice", lat:53.2743, lon:-9.049, address:"3 Eyre Square, Galway City", phone:"+353-91-562-1234", email:"info@eyresquaremedical.ie" },
  { name:"Dr. Sean Byrne", county:"Galway", practice:"Salthill Family Clinic", lat:53.2599, lon:-9.077, address:"Upper Salthill, Galway", phone:"+353-91-521-5678", email:"appointments@salthillclinic.ie" },
  { name:"Dr. Orla Maguire", county:"Galway", practice:"Tuam Primary Care Centre", lat:53.5133, lon:-8.8558, address:"Vicar Street, Tuam, Co. Galway", phone:"+353-93-241-2345", email:"tuampcc@hse.ie" },
  { name:"Dr. Tom Higgins", county:"Limerick", practice:"O'Connell Street Medical Centre", lat:52.6638, lon:-8.6267, address:"48 O'Connell Street, Limerick City", phone:"+353-61-415-1234", email:"reception@oconnellmc.ie" },
  { name:"Dr. Margaret Daly", county:"Limerick", practice:"Castletroy Medical Practice", lat:52.6741, lon:-8.5524, address:"Castletroy Shopping Centre, Limerick", phone:"+353-61-331-5678", email:"info@castletroymedical.ie" },
  { name:"Dr. Kevin Barry", county:"Limerick", practice:"Newcastle West Health Centre", lat:52.4491, lon:-9.059, address:"Gortboy, Newcastle West, Co. Limerick", phone:"+353-69-621-2345", email:"nwesthc@hse.ie" },
  { name:"Dr. Emily Brennan", county:"Kildare", practice:"Naas Medical Centre", lat:53.2159, lon:-6.6597, address:"Dublin Road, Naas, Co. Kildare", phone:"+353-45-897-1234", email:"reception@naasmedical.ie" },
  { name:"Dr. Ronan Gallagher", county:"Kildare", practice:"Maynooth Family Practice", lat:53.3813, lon:-6.5916, address:"22 Main Street, Maynooth, Co. Kildare", phone:"+353-1-628-5678", email:"info@maynoothfp.ie" },
  { name:"Dr. Helen O'Brien", county:"Kildare", practice:"Celbridge Primary Care", lat:53.3388, lon:-6.5441, address:"Main Street, Celbridge, Co. Kildare", phone:"+353-1-627-2345", email:"celbridgepc@hse.ie" },
];

const LOCATIONS = {
  "dublin":[53.3498,-6.2603],"dublin 2":[53.3382,-6.2591],"cork":[51.8985,-8.4756],"galway":[53.2707,-9.0568],"limerick":[52.6638,-8.6267],"naas":[53.2159,-6.6597],"maynooth":[53.3813,-6.5916],"clontarf":[53.3647,-6.1778],"ranelagh":[53.3244,-6.2514],
};

function haversine(lat1,lon1,lat2,lon2){
  const R=6371,toR=n=>n*Math.PI/180;
  const dLat=toR(lat2-lat1),dLon=toR(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toR(lat1))*Math.cos(toR(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function analyzeText(text){
  const lower=text.toLowerCase();
  const words=new Set(lower.match(/\b\w+\b/g)||[]);
  const flags=[];
  for(const[cat,data]of Object.entries(MENTAL_HEALTH_INDICATORS)){
    const matched=data.keywords.filter(k=>k.includes(" ")?lower.includes(k):words.has(k));
    if(matched.length>0){
      flags.push({category:cat.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),confidence:Math.min(matched.length/5,1),matched,description:data.description,color:data.color});
    }
  }
  flags.sort((a,b)=>b.confidence-a.confidence);
  const sentences=text.split(/(?<=[.!?])\s+/);
  const summary=sentences.slice(0,3).join(" ")+(sentences.length>3?" ...":"");
  return{flags,summary,primary:flags[0]||null,timestamp:new Date().toISOString()};
}

function findClosestGP(location){
  const loc=location.toLowerCase().trim();
  let coords=LOCATIONS[loc]||LOCATIONS["dublin"];
  for(const[k,v]of Object.entries(LOCATIONS)){if(loc.includes(k)||k.includes(loc)){coords=v;break;}}
  const sorted=GP_DATABASE.map(gp=>({...gp,distance:haversine(coords[0],coords[1],gp.lat,gp.lon)})).sort((a,b)=>a.distance-b.distance);
  return sorted[0];
}

// --- SCREENS ---

function StartScreen({onStart}){
  const[show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),100);},[]);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(145deg, #0a0e17 0%, #111827 40%, #1a1f2e 100%)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)"}}/>
      <div style={{textAlign:"center",zIndex:1,opacity:show?1:0,transform:show?"translateY(0)":"translateY(30px)",transition:"all 1s cubic-bezier(0.16, 1, 0.3, 1)",maxWidth:520,padding:"0 24px"}}>
        <div style={{width:80,height:80,margin:"0 auto 32px",borderRadius:20,background:"linear-gradient(135deg, #3B82F6, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(59,130,246,0.3)"}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="white"/><circle cx="15" cy="9" r="1" fill="white"/></svg>
        </div>
        <h1 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:42,color:"#F1F5F9",margin:"0 0 12px",fontWeight:700,letterSpacing:"-0.5px"}}>Clarity</h1>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:17,color:"#94A3B8",margin:"0 0 48px",lineHeight:1.7}}>A safe space to express how you feel. We listen, identify what you might be going through, and connect you with the right support nearby.</p>
        <button onClick={onStart} style={{fontFamily:"'DM Sans', sans-serif",fontSize:16,fontWeight:600,padding:"16px 48px",background:"linear-gradient(135deg, #3B82F6, #7C3AED)",color:"white",border:"none",borderRadius:12,cursor:"pointer",letterSpacing:"0.5px",boxShadow:"0 4px 24px rgba(59,130,246,0.3)",transition:"all 0.3s"}} onMouseEnter={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 8px 32px rgba(59,130,246,0.4)";}} onMouseLeave={e=>{e.target.style.transform="translateY(0)";e.target.style.boxShadow="0 4px 24px rgba(59,130,246,0.3)";}}>Let's Talk</button>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:12,color:"#475569",marginTop:32}}>This is a screening aid, not a diagnostic tool. Always consult a professional.</p>
      </div>
    </div>
  );
}

function ProfileTab({profile,setProfile,onClose}){
  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:380,background:"#111827",borderLeft:"1px solid #1E293B",zIndex:100,padding:32,overflowY:"auto",boxShadow:"-8px 0 32px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <h2 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:24,color:"#F1F5F9",margin:0}}>Your Profile</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#94A3B8",fontSize:24,cursor:"pointer"}}>x</button>
      </div>
      {[{label:"Name",key:"name",placeholder:"Enter your name"},{label:"Location",key:"location",placeholder:"e.g. Dublin 2, Cork, Galway"},{label:"Age",key:"age",placeholder:"Your age"},{label:"Emergency Contact",key:"emergency",placeholder:"Phone number"}].map(f=>(
        <div key={f.key} style={{marginBottom:20}}>
          <label style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8",display:"block",marginBottom:6,letterSpacing:"0.5px",textTransform:"uppercase"}}>{f.label}</label>
          <input value={profile[f.key]||""} onChange={e=>setProfile({...profile,[f.key]:e.target.value})} placeholder={f.placeholder} style={{width:"100%",padding:"12px 16px",background:"#1E293B",border:"1px solid #334155",borderRadius:8,color:"#F1F5F9",fontSize:15,fontFamily:"'DM Sans', sans-serif",outline:"none",boxSizing:"border-box"}}/>
        </div>
      ))}
      <div style={{marginTop:24,padding:16,background:"rgba(59,130,246,0.08)",borderRadius:10,border:"1px solid rgba(59,130,246,0.15)"}}>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8",margin:0,lineHeight:1.6}}>Your profile data stays on your device. It is only used to find the nearest GP and is never shared without your consent.</p>
      </div>
    </div>
  );
}

function InputScreen({onAnalyze,profile}){
  const[text,setText]=useState("");
  const[mode,setMode]=useState("text");
  const[recording,setRecording]=useState(false);
  const[seconds,setSeconds]=useState(0);
  const[transcribing,setTranscribing]=useState(false);
  const[voiceError,setVoiceError]=useState("");
  const timerRef=useRef(null);
  const mediaRecorderRef=useRef(null);
  const chunksRef=useRef([]);
  const recognitionRef=useRef(null);

  const startRecording=async()=>{
    setVoiceError("");
    // Try Web Speech API for real-time transcription
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SpeechRecognition){
      const recognition=new SpeechRecognition();
      recognition.continuous=true;
      recognition.interimResults=true;
      recognition.lang="en-US";
      let finalTranscript="";
      recognition.onresult=(event)=>{
        let interim="";
        for(let i=event.resultIndex;i<event.results.length;i++){
          if(event.results[i].isFinal){
            finalTranscript+=event.results[i][0].transcript+" ";
          }else{
            interim+=event.results[i][0].transcript;
          }
        }
        setText(finalTranscript+interim);
      };
      recognition.onerror=(event)=>{
        if(event.error==="not-allowed"){
          setVoiceError("Microphone access denied. Please allow microphone access in your browser settings.");
        }else if(event.error==="no-speech"){
          // Ignore no-speech, user might just be pausing
        }else{
          setVoiceError("Speech recognition error: "+event.error);
        }
      };
      recognition.onend=()=>{
        // If still recording, restart (speech recognition auto-stops after silence)
        if(recording){
          try{recognition.start();}catch(e){}
        }
      };
      try{
        recognition.start();
        recognitionRef.current=recognition;
        setRecording(true);
        setSeconds(0);
        timerRef.current=setInterval(()=>setSeconds(s=>s+1),1000);
      }catch(e){
        setVoiceError("Could not start speech recognition: "+e.message);
      }
    }else{
      // Fallback: just record audio via MediaRecorder (no transcription in browser)
      try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        const mediaRecorder=new MediaRecorder(stream);
        chunksRef.current=[];
        mediaRecorder.ondataavailable=(e)=>{if(e.data.size>0)chunksRef.current.push(e.data);};
        mediaRecorder.onstop=()=>{
          stream.getTracks().forEach(t=>t.stop());
          setVoiceError("Recording captured but browser speech recognition is not supported. Please type your text instead, or use Chrome/Edge for voice transcription.");
        };
        mediaRecorder.start();
        mediaRecorderRef.current=mediaRecorder;
        setRecording(true);
        setSeconds(0);
        timerRef.current=setInterval(()=>setSeconds(s=>s+1),1000);
      }catch(e){
        setVoiceError("Microphone access denied. Please allow microphone access and try again.");
      }
    }
  };

  const stopRecording=()=>{
    setRecording(false);
    clearInterval(timerRef.current);
    if(recognitionRef.current){
      recognitionRef.current.onend=null;
      recognitionRef.current.stop();
      recognitionRef.current=null;
    }
    if(mediaRecorderRef.current&&mediaRecorderRef.current.state==="recording"){
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current=null;
    }
  };

  return(
    <div style={{maxWidth:640,margin:"0 auto",padding:"48px 24px"}}>
      <h2 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:28,color:"#F1F5F9",margin:"0 0 8px"}}>How are you feeling?</h2>
      <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,color:"#94A3B8",margin:"0 0 32px"}}>Type or speak about what's on your mind. Take your time.</p>

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{id:"text",label:"Text"},{id:"voice",label:"Voice"}].map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)} style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,fontWeight:600,padding:"10px 24px",background:mode===m.id?"rgba(59,130,246,0.15)":"transparent",color:mode===m.id?"#3B82F6":"#64748B",border:mode===m.id?"1px solid rgba(59,130,246,0.3)":"1px solid #334155",borderRadius:8,cursor:"pointer",transition:"all 0.2s"}}>{m.label}</button>
        ))}
      </div>

      {mode==="text"?(
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="I've been feeling..." rows={8} style={{width:"100%",padding:16,background:"#1E293B",border:"1px solid #334155",borderRadius:12,color:"#F1F5F9",fontSize:16,fontFamily:"'DM Sans', sans-serif",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}}/>
      ):(
        <div style={{padding:48,background:"#1E293B",border:"1px solid #334155",borderRadius:12,textAlign:"center"}}>
          {!recording?(
            <button onClick={startRecording} style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg, #EF4444, #DC2626)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 4px 24px rgba(239,68,68,0.3)",transition:"all 0.3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.05)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
          ):(
            <button onClick={stopRecording} style={{width:80,height:80,borderRadius:"50%",background:"#1E293B",border:"3px solid #EF4444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"pulse 1.5s infinite"}}>
              <div style={{width:24,height:24,borderRadius:4,background:"#EF4444"}}/>
            </button>
          )}
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#94A3B8",margin:0}}>{recording?`Recording... ${seconds}s`:"Tap to start recording"}</p>
          {recording&&<style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}`}</style>}
          {voiceError&&<p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#EF4444",marginTop:12}}>{voiceError}</p>}
          {text&&!recording&&(
            <div style={{marginTop:16,padding:14,background:"#0F172A",borderRadius:8,textAlign:"left",maxHeight:150,overflowY:"auto"}}>
              <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Transcription</p>
              <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#CBD5E1",margin:0,lineHeight:1.6}}>{text}</p>
            </div>
          )}
        </div>
      )}

      {text&&(
        <button onClick={()=>onAnalyze(text)} style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,fontWeight:600,padding:"14px 36px",background:"linear-gradient(135deg, #3B82F6, #7C3AED)",color:"white",border:"none",borderRadius:10,cursor:"pointer",marginTop:20,width:"100%",letterSpacing:"0.3px",boxShadow:"0 4px 16px rgba(59,130,246,0.25)"}}>Analyze</button>
      )}
    </div>
  );
}

function AnalysisScreen({analysis,onNext}){
  const[show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),200);},[]);
  return(
    <div style={{maxWidth:640,margin:"0 auto",padding:"48px 24px",opacity:show?1:0,transform:show?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease-out"}}>
      <h2 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:28,color:"#F1F5F9",margin:"0 0 8px"}}>Screening Results</h2>
      <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#94A3B8",margin:"0 0 32px"}}>Based on what you shared, here's what we identified.</p>

      <div style={{padding:20,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.12)",borderRadius:12,marginBottom:28}}>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Summary</p>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,color:"#CBD5E1",margin:0,lineHeight:1.7}}>{analysis.summary}</p>
      </div>

      <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 16px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Detected Concerns</p>

      {analysis.flags.map((flag,i)=>(
        <div key={i} style={{padding:20,background:"#1E293B",border:"1px solid #334155",borderRadius:12,marginBottom:12,transition:"all 0.3s",animationDelay:`${i*150}ms`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontFamily:"'DM Sans', sans-serif",fontSize:16,fontWeight:600,color:"#F1F5F9"}}>{flag.category}</span>
            <span style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:600,color:flag.color,background:`${flag.color}18`,padding:"4px 12px",borderRadius:20}}>{Math.round(flag.confidence*100)}%</span>
          </div>
          <div style={{height:6,background:"#0F172A",borderRadius:3,marginBottom:10,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${flag.confidence*100}%`,background:`linear-gradient(90deg, ${flag.color}, ${flag.color}88)`,borderRadius:3,transition:"width 1s ease-out"}}/>
          </div>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8",margin:"0 0 8px"}}>{flag.description}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {flag.matched.map((kw,j)=>(
              <span key={j} style={{fontFamily:"'DM Sans', sans-serif",fontSize:11,color:flag.color,background:`${flag.color}12`,border:`1px solid ${flag.color}30`,padding:"3px 10px",borderRadius:20}}>{kw}</span>
            ))}
          </div>
        </div>
      ))}

      <div style={{padding:16,background:"rgba(234,179,8,0.06)",border:"1px solid rgba(234,179,8,0.15)",borderRadius:10,marginTop:20,marginBottom:24}}>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#EAB308",margin:0}}>DISCLAIMER: This is NOT a clinical diagnosis. These are indicators detected from text patterns. Please consult a licensed mental health professional.</p>
      </div>

      <button onClick={onNext} style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,fontWeight:600,padding:"14px 36px",background:"linear-gradient(135deg, #3B82F6, #7C3AED)",color:"white",border:"none",borderRadius:10,cursor:"pointer",width:"100%",boxShadow:"0 4px 16px rgba(59,130,246,0.25)"}}>Find Nearest GP</button>
    </div>
  );
}

function GPScreen({gp,onConsent}){
  const[show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),200);},[]);
  return(
    <div style={{maxWidth:640,margin:"0 auto",padding:"48px 24px",opacity:show?1:0,transform:show?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease-out"}}>
      <h2 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:28,color:"#F1F5F9",margin:"0 0 8px"}}>Your Nearest GP</h2>
      <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#94A3B8",margin:"0 0 32px"}}>We found the closest GP who can help.</p>

      <div style={{background:"#1E293B",border:"1px solid #334155",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"20px 24px",background:"linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",borderBottom:"1px solid #334155"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <h3 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:22,color:"#F1F5F9",margin:"0 0 4px"}}>{gp.name}</h3>
              <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#94A3B8",margin:0}}>{gp.practice}</p>
            </div>
            <div style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:8,padding:"6px 14px"}}>
              <span style={{fontFamily:"'DM Sans', sans-serif",fontSize:12,fontWeight:600,color:"#22C55E"}}>{gp.distance.toFixed(1)} km</span>
            </div>
          </div>
        </div>

        <div style={{padding:24}}>
          {[{icon:"M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",sub:"M15 11a3 3 0 11-6 0 3 3 0 016 0z",label:gp.address},{icon:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",label:gp.phone},{icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",label:gp.email}].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,marginBottom:i<2?16:0}}>
              <div style={{width:36,height:36,borderRadius:8,background:"rgba(59,130,246,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d={item.icon}/>{item.sub&&<path d={item.sub}/>}</svg>
              </div>
              <span style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#CBD5E1"}}>{item.label}</span>
            </div>
          ))}
          <div style={{marginTop:16,padding:"8px 14px",background:"rgba(59,130,246,0.06)",borderRadius:8,display:"inline-block"}}>
            <span style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8"}}>County: {gp.county}</span>
          </div>
        </div>
      </div>

      <button onClick={()=>onConsent(true)} style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,fontWeight:600,padding:"14px 36px",background:"linear-gradient(135deg, #22C55E, #16A34A)",color:"white",border:"none",borderRadius:10,cursor:"pointer",width:"100%",marginTop:24,boxShadow:"0 4px 16px rgba(34,197,94,0.25)"}}>Consent & Notify GP</button>
      <button onClick={()=>onConsent(false)} style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,padding:"12px 36px",background:"transparent",color:"#64748B",border:"1px solid #334155",borderRadius:10,cursor:"pointer",width:"100%",marginTop:10}}>Decline -- Keep Private</button>
    </div>
  );
}

function ConsentDialog({analysis,gp,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#1E293B",border:"1px solid #334155",borderRadius:16,padding:32,maxWidth:480,width:"90%",boxShadow:"0 24px 48px rgba(0,0,0,0.4)"}}>
        <h3 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:22,color:"#F1F5F9",margin:"0 0 16px"}}>Confirm Sharing</h3>

        <div style={{marginBottom:20}}>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Will be shared:</p>
          <div style={{padding:14,background:"#0F172A",borderRadius:8}}>
            {["Summary of your speech (not the full text)",`Detected concern(s): ${analysis.flags.map(f=>f.category).join(", ")}`,`Timestamp: ${new Date(analysis.timestamp).toLocaleString()}`].map((item,i)=>(
              <p key={i} style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#CBD5E1",margin:i<2?"0 0 6px":0}}>- {item}</p>
            ))}
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Will NOT be shared:</p>
          <div style={{padding:14,background:"#0F172A",borderRadius:8}}>
            {["Your full text / raw recording","Any personal identifiers"].map((item,i)=>(
              <p key={i} style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#CBD5E1",margin:i<1?"0 0 6px":0}}>- {item}</p>
            ))}
          </div>
        </div>

        <div style={{padding:12,background:"rgba(59,130,246,0.06)",borderRadius:8,marginBottom:24,border:"1px solid rgba(59,130,246,0.12)"}}>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8",margin:0}}>Sending to: {gp.name} at {gp.practice}</p>
        </div>

        <div style={{display:"flex",gap:12}}>
          <button onClick={onCancel} style={{fontFamily:"'DM Sans', sans-serif",flex:1,padding:"12px",background:"transparent",color:"#94A3B8",border:"1px solid #334155",borderRadius:10,cursor:"pointer",fontSize:14}}>Cancel</button>
          <button onClick={onConfirm} style={{fontFamily:"'DM Sans', sans-serif",flex:1,padding:"12px",background:"linear-gradient(135deg, #22C55E, #16A34A)",color:"white",border:"none",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600}}>Confirm & Send</button>
        </div>
      </div>
    </div>
  );
}

function EmailStatus({success,gp,onFinish}){
  const[show,setShow]=useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),200);},[]);
  return(
    <div style={{maxWidth:640,margin:"0 auto",padding:"48px 24px",textAlign:"center",opacity:show?1:0,transform:show?"translateY(0)":"translateY(20px)",transition:"all 0.6s ease-out"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:success?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)",border:success?"2px solid rgba(34,197,94,0.3)":"2px solid rgba(239,68,68,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px"}}>
        {success?(
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        ):(
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        )}
      </div>

      <h2 style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:28,color:"#F1F5F9",margin:"0 0 12px"}}>{success?"Notification Sent":"Sending Failed"}</h2>
      <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,color:"#94A3B8",margin:"0 0 32px",lineHeight:1.7}}>{success?`Your screening summary has been sent to ${gp.name} at ${gp.practice}. They will review it and respond.`:"The email could not be sent. Please check your connection or contact the GP directly."}</p>

      {success&&(
        <div style={{background:"#1E293B",border:"1px solid #334155",borderRadius:12,padding:20,textAlign:"left",marginBottom:32}}>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#64748B",margin:"0 0 12px",textTransform:"uppercase",letterSpacing:"0.5px"}}>GP Contact Details</p>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,color:"#F1F5F9",margin:"0 0 4px",fontWeight:600}}>{gp.name}</p>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#CBD5E1",margin:"0 0 4px"}}>{gp.practice}</p>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#CBD5E1",margin:"0 0 4px"}}>{gp.phone}</p>
          <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:14,color:"#3B82F6",margin:0}}>{gp.email}</p>
        </div>
      )}

      <div style={{padding:16,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.12)",borderRadius:10,marginBottom:24}}>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#94A3B8",margin:"0 0 4px"}}>Crisis Resources:</p>
        <p style={{fontFamily:"'DM Sans', sans-serif",fontSize:13,color:"#CBD5E1",margin:0}}>Samaritans: 116 123 | Pieta House: 1800 247 247 | Text: 50808</p>
      </div>

      <button onClick={onFinish} style={{fontFamily:"'DM Sans', sans-serif",fontSize:15,fontWeight:600,padding:"14px 36px",background:"linear-gradient(135deg, #3B82F6, #7C3AED)",color:"white",border:"none",borderRadius:10,cursor:"pointer",boxShadow:"0 4px 16px rgba(59,130,246,0.25)"}}>Start New Session</button>
    </div>
  );
}

// --- MAIN APP ---

export default function App(){
  const[screen,setScreen]=useState("start");
  const[profile,setProfile]=useState({name:"",location:"Dublin",age:"",emergency:""});
  const[showProfile,setShowProfile]=useState(false);
  const[analysis,setAnalysis]=useState(null);
  const[gp,setGP]=useState(null);
  const[showConsent,setShowConsent]=useState(false);
  const[emailSent,setEmailSent]=useState(false);

  const handleAnalyze=(text)=>{
    const result=analyzeText(text);
    setAnalysis({...result,original_text:text});
    if(result.flags.length>0)setScreen("analysis");
    else alert("No mental health indicators detected. If you are struggling, please reach out to a professional.");
  };

  const handleFindGP=()=>{
    const closest=findClosestGP(profile.location);
    setGP(closest);
    setScreen("gp");
  };

  const handleConsent=(agreed)=>{
    if(agreed)setShowConsent(true);
    else{setScreen("start");setAnalysis(null);setGP(null);}
  };

  const handleConfirmSend=()=>{
    setShowConsent(false);
    // In production, this would call the backend send_email function
    setEmailSent(true);
    setScreen("email");
  };

  const handleFinish=()=>{
    setScreen("start");setAnalysis(null);setGP(null);setEmailSent(false);
  };

  return(
    <div style={{minHeight:"100vh",background:"#0F172A",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {screen!=="start"&&(
        <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(15,23,42,0.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid #1E293B",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg, #3B82F6, #8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="white"/><circle cx="15" cy="9" r="1" fill="white"/></svg>
            </div>
            <span style={{fontFamily:"'Playfair Display', Georgia, serif",fontSize:18,color:"#F1F5F9",fontWeight:600}}>Clarity</span>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:16}}>
            {["input","analysis","gp","email"].map((s,i)=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:screen===s?"#3B82F6":["input","analysis","gp","email"].indexOf(screen)>i?"#22C55E":"#334155",transition:"all 0.3s"}}/>
                {i<3&&<div style={{width:24,height:1,background:"#334155"}}/>}
              </div>
            ))}
            <button onClick={()=>setShowProfile(!showProfile)} style={{marginLeft:8,width:36,height:36,borderRadius:"50%",background:"#1E293B",border:"1px solid #334155",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontFamily:"'DM Sans', sans-serif",fontWeight:600}}>{profile.name?profile.name[0].toUpperCase():"?"}</button>
          </div>
        </nav>
      )}

      {screen==="start"&&<StartScreen onStart={()=>setScreen("input")}/>}
      {screen==="input"&&<InputScreen onAnalyze={handleAnalyze} profile={profile}/>}
      {screen==="analysis"&&analysis&&<AnalysisScreen analysis={analysis} onNext={handleFindGP}/>}
      {screen==="gp"&&gp&&<GPScreen gp={gp} onConsent={handleConsent}/>}
      {screen==="email"&&gp&&<EmailStatus success={true} gp={gp} onFinish={handleFinish}/>}

      {showConsent&&analysis&&gp&&<ConsentDialog analysis={analysis} gp={gp} onConfirm={handleConfirmSend} onCancel={()=>setShowConsent(false)}/>}
      {showProfile&&<ProfileTab profile={profile} setProfile={setProfile} onClose={()=>setShowProfile(false)}/>}
    </div>
  );
}
