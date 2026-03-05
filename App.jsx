import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import {
  Users, TrendingUp, MessageCircle, Mail, Plus, Search, Edit2, Trash2,
  X, BarChart3, Home, Send, ChevronRight, CheckCircle,
  ExternalLink, ArrowRight, Target, Zap, Check, Award, Clock
} from "lucide-react";

// 🔥 Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7tuRYUEY471IPJdnOB69DI2yKLCU72T0",
  authDomain: "salesflow-crm-13c4a.firebaseapp.com",
  projectId: "salesflow-crm-13c4a",
  storageBucket: "salesflow-crm-13c4a.firebasestorage.app",
  messagingSenderId: "525995422237",
  appId: "1:525995422237:web:e69d7e7dd76ac9640c8cf4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STAGES = ["Lead", "Contactado", "Propuesta", "Negociación", "Ganado", "Perdido"];

const STAGE_META = {
  Lead:        { color: "#6366f1", bg: "#eef2ff", label: "🔵 Lead",        badge: "bg-indigo-100 text-indigo-700"  },
  Contactado:  { color: "#0ea5e9", bg: "#e0f2fe", label: "📞 Contactado",  badge: "bg-sky-100 text-sky-700"        },
  Propuesta:   { color: "#f59e0b", bg: "#fef3c7", label: "📄 Propuesta",   badge: "bg-amber-100 text-amber-700"    },
  Negociación: { color: "#f97316", bg: "#fff7ed", label: "🤝 Negociación", badge: "bg-orange-100 text-orange-700"  },
  Ganado:      { color: "#10b981", bg: "#d1fae5", label: "✅ Ganado",      badge: "bg-emerald-100 text-emerald-700"},
  Perdido:     { color: "#ef4444", bg: "#fee2e2", label: "❌ Perdido",     badge: "bg-red-100 text-red-700"        },
};

const WA_TEMPLATES = [
  { id: 1, name: "Saludo inicial",     icon: "👋", text: "Hola {nombre}, mi nombre es {vendedor} y te contacto para presentarte nuestros servicios. ¿Tienes unos minutos para platicar esta semana?" },
  { id: 2, name: "Seguimiento",        icon: "🔄", text: "Hola {nombre}, espero que estés muy bien. Quería hacer seguimiento a nuestra conversación. ¿Has tenido oportunidad de revisar lo que hablamos?" },
  { id: 3, name: "Envío de propuesta", icon: "📄", text: "Hola {nombre}, acabo de enviarte por correo la propuesta personalizada para tu proyecto. ¿La pudiste revisar? Con gusto te explico cualquier detalle." },
  { id: 4, name: "Oferta especial",    icon: "⚡", text: "Hola {nombre}, tenemos una promoción especial disponible solo hasta el viernes. Me gustaría compartirte los detalles. ¿Cuándo podemos hablar?" },
  { id: 5, name: "Cierre de venta",    icon: "🎯", text: "Hola {nombre}, estamos listos para comenzar tu proyecto cuando tú lo decidas. Solo dime y arrancamos. ¡Va a quedar increíble!" },
  { id: 6, name: "Post-venta",         icon: "⭐", text: "Hola {nombre}, ¿cómo te ha ido con nuestros servicios? Tu opinión es muy valiosa para nosotros. Si necesitas algo, aquí estoy." },
];

const EMAIL_TEMPLATES = [
  { id: 1, name: "Presentación",    icon: "📧", subject: "Presentación de nuestros servicios – {empresa}", body: `Estimado/a {nombre},\n\nEspero que se encuentre muy bien. Me permito contactarle para presentarle nuestros servicios de consultoría, los cuales han ayudado a empresas como la suya a optimizar sus procesos y aumentar su rentabilidad.\n\n¿Tendría disponibilidad para una breve llamada esta semana?\n\nQuedo a sus órdenes,\n{vendedor}` },
  { id: 2, name: "Seguimiento",     icon: "🔁", subject: "Seguimiento – Propuesta para {empresa}", body: `Estimado/a {nombre},\n\nMe pongo en contacto para hacer seguimiento a la propuesta que le compartimos hace unos días.\n\n¿Ha tenido oportunidad de revisarla?\n\nQuedo en espera de sus comentarios.\n\nSaludos cordiales,\n{vendedor}` },
  { id: 3, name: "Propuesta",       icon: "📋", subject: "Propuesta personalizada para {empresa}", body: `Estimado/a {nombre},\n\nAdjunto encontrará nuestra propuesta personalizada para {empresa}.\n\nEn ella encontrará:\n• Descripción del servicio propuesto\n• Cronograma de trabajo\n• Inversión requerida\n• Garantías y condiciones\n\n¿Cuándo le vendría bien agendar una reunión?\n\nSaludos,\n{vendedor}` },
  { id: 4, name: "Reactivación",    icon: "🔥", subject: "¡Nos gustaría retomar el contacto!", body: `Estimado/a {nombre},\n\nHace algún tiempo tuvimos el gusto de platicar sobre cómo podíamos apoyarle.\n\nHemos lanzado nuevos servicios que creo podrían interesarle.\n\n¿Le gustaría que le compartiera las novedades?\n\nSaludos,\n{vendedor}` },
];

function Badge({ stage }) {
  const m = STAGE_META[stage] || {};
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.badge}`}>{stage}</span>;
}

function Avatar({ name, size = 8 }) {
  const colors = ["bg-indigo-500","bg-sky-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-violet-500","bg-teal-500"];
  const i = name.charCodeAt(0) % colors.length;
  const initials = name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className={`w-${size} h-${size} rounded-full ${colors[i]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"} max-h-screen overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState(client || { name:"", phone:"", email:"", company:"", stage:"Lead", value:"", notes:"" });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const handleSave = () => {
    if (!form.name.trim()) { alert("El nombre es requerido"); return; }
    onSave({ ...form, value: parseFloat(form.value) || 0 });
  };
  return (
    <Modal title={client ? "Editar Cliente" : "Agregar Cliente"} onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input value={form.name} onChange={e=>set("name",e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Juan Pérez"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
          <input value={form.phone} onChange={e=>set("phone",e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="8112345678"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input value={form.email} onChange={e=>set("email",e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="juan@empresa.com"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input value={form.company} onChange={e=>set("company",e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Mi Empresa SA"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor potencial (MXN)</label>
          <input type="number" value={form.value} onChange={e=>set("value",e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="25000"/>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
          <div className="grid grid-cols-3 gap-2">
            {STAGES.map(s => (
              <button key={s} type="button" onClick={()=>set("stage",s)} className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${form.stage===s ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"}`}>
                {STAGE_META[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Información adicional..."/>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
        <button type="button" onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">
          {client ? "Guardar cambios" : "Agregar cliente"}
        </button>
      </div>
    </Modal>
  );
}

function Dashboard({ clients, setView }) {
  const won    = clients.filter(c=>c.stage==="Ganado");
  const active = clients.filter(c=>!["Ganado","Perdido"].includes(c.stage));
  const pipeline = active.reduce((s,c)=>s+(c.value||0),0);
  const rate     = clients.length ? Math.round((won.length/clients.length)*100) : 0;
  const recent   = [...clients].sort((a,b)=>new Date(b.created)-new Date(a.created)).slice(0,5);
  const stageCounts = STAGES.map(s=>({ stage:s, count:clients.filter(c=>c.stage===s).length }));
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido a tu sistema de ventas</p>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label:"Total Clientes",  value:clients.length,  icon:Users,      color:"bg-indigo-500", sub:"registrados" },
          { label:"En Pipeline",     value:active.length,   icon:TrendingUp, color:"bg-sky-500",    sub:"activas" },
          { label:"Pipeline Valor",  value:`$${(pipeline/1000).toFixed(0)}k`, icon:Target, color:"bg-amber-500", sub:"MXN potencial" },
          { label:"Tasa de cierre",  value:`${rate}%`,      icon:Award,      color:"bg-emerald-500",sub:"ganados" },
        ].map(({ label, value, icon:Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}><Icon size={22} className="text-white"/></div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><BarChart3 size={18} className="text-indigo-500"/>Pipeline</h3>
          <div className="space-y-3">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600 font-medium">{stage}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width:`${clients.length?(count/clients.length)*100:0}%`, backgroundColor: STAGE_META[stage].color }}/>
                </div>
                <div className="w-6 text-xs font-bold text-gray-700">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={18} className="text-indigo-500"/>Recientes</h3>
            <button onClick={()=>setView("clients")} className="text-xs text-indigo-600 font-medium flex items-center gap-1">Ver todos <ChevronRight size={14}/></button>
          </div>
          <div className="space-y-3">
            {recent.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                <Avatar name={c.name}/>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-400 truncate">{c.company}</div>
                </div>
                <Badge stage={c.stage}/>
                <div className="text-sm font-bold text-gray-700">${(c.value||0).toLocaleString()}</div>
              </div>
            ))}
            {recent.length===0 && <div className="text-center py-8 text-gray-400 text-sm">Aún no hay clientes.</div>}
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label:"WhatsApp", sub:"Mensajes personalizados", icon:MessageCircle, view:"whatsapp", color:"bg-green-50 text-green-700 border-green-200" },
          { label:"Email",    sub:"Campañas de correo",      icon:Mail,          view:"email",    color:"bg-blue-50 text-blue-700 border-blue-200"   },
          { label:"Pipeline", sub:"Gestiona oportunidades",  icon:TrendingUp,    view:"pipeline", color:"bg-indigo-50 text-indigo-700 border-indigo-200" },
        ].map(({ label, sub, icon:Icon, view:v, color }) => (
          <button key={v} onClick={()=>setView(v)} className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${color} hover:shadow-md transition-all text-left`}>
            <Icon size={24}/><div><div className="font-semibold text-sm">{label}</div><div className="text-xs opacity-70">{sub}</div></div>
            <ArrowRight size={16} className="ml-auto opacity-50"/>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClientsView({ clients, onAdd, onEdit, onDelete, onMove }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q)||(c.email||"").toLowerCase().includes(q)||(c.company||"").toLowerCase().includes(q)||(c.phone||"").includes(q))
      && (filter==="Todos"||c.stage===filter);
  });
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Clientes</h1><p className="text-gray-500 mt-1">{clients.length} contactos</p></div>
        <button onClick={onAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm"><Plus size={18}/> Agregar cliente</button>
      </div>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-4 top-3.5 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Todos",...STAGES].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-3 rounded-xl text-xs font-semibold border ${filter===s?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-600 border-gray-200"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Cliente","Empresa","Contacto","Etapa","Valor","Notas","Acciones"].map(h=>(
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c=>(
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name}/>
                      <div><div className="font-semibold text-sm text-gray-900">{c.name}</div><div className="text-xs text-gray-400">{c.email}</div></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{c.company}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {c.phone&&<a href={`https://wa.me/52${c.phone}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100"><MessageCircle size={14}/></a>}
                      {c.email&&<a href={`mailto:${c.email}`} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><Mail size={14}/></a>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select value={c.stage} onChange={e=>onMove(c.id,e.target.value)} className="text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none" style={{backgroundColor:STAGE_META[c.stage]?.bg,color:STAGE_META[c.stage]?.color}}>
                      {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-700">${(c.value||0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate">{c.notes||"—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={()=>onEdit(c)} className="w-8 h-8 rounded-full hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center"><Edit2 size={14}/></button>
                      <button onClick={()=>onDelete(c.id)} className="w-8 h-8 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<div className="text-center py-16 text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-30"/><p>No se encontraron clientes</p></div>}
        </div>
      </div>
    </div>
  );
}

function PipelineView({ clients, onMove, onEdit }) {
  return (
    <div className="p-8 flex flex-col" style={{height:"calc(100vh - 0px)"}}>
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Pipeline</h1><p className="text-gray-500 mt-1">Gestiona el avance de cada oportunidad</p></div>
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.filter(s=>s!=="Perdido").map(stage=>{
          const sc=clients.filter(c=>c.stage===stage);
          const total=sc.reduce((s,c)=>s+(c.value||0),0);
          const meta=STAGE_META[stage];
          return (
            <div key={stage} className="flex-shrink-0 w-64 flex flex-col">
              <div className="rounded-2xl p-4 mb-3" style={{backgroundColor:meta.bg}}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase" style={{color:meta.color}}>{stage}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white" style={{color:meta.color}}>{sc.length}</span>
                </div>
                <div className="text-sm font-bold text-gray-700">${total.toLocaleString()}</div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {sc.map(c=>(
                  <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={c.name} size={7}/>
                      <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{c.name}</div><div className="text-xs text-gray-400 truncate">{c.company}</div></div>
                    </div>
                    <div className="text-base font-bold mb-2">${(c.value||0).toLocaleString()}</div>
                    {c.notes&&<p className="text-xs text-gray-500 mb-2 line-clamp-2">{c.notes}</p>}
                    <div className="flex gap-1 flex-wrap">
                      {STAGES.filter(s=>s!==stage).slice(0,3).map(s=>(
                        <button key={s} onClick={()=>onMove(c.id,s)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600">→ {s}</button>
                      ))}
                    </div>
                    <button onClick={()=>onEdit(c)} className="mt-2 w-full text-xs text-indigo-600 font-medium py-1 flex items-center justify-center gap-1"><Edit2 size={12}/>Editar</button>
                  </div>
                ))}
                {sc.length===0&&<div className="text-center py-8 text-gray-300 text-xs border-2 border-dashed border-gray-200 rounded-xl">Sin clientes</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WhatsAppView({ clients }) {
  const [selected, setSelected] = useState([]);
  const [template, setTemplate] = useState(WA_TEMPLATES[0]);
  const [customMsg, setCustomMsg] = useState(WA_TEMPLATES[0].text);
  const [vendedor, setVendedor] = useState("tu nombre");
  const [search, setSearch] = useState("");
  const [sent, setSent] = useState({});
  const toggle=(id)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.company||"").toLowerCase().includes(search.toLowerCase()));
  const buildMsg=(c)=>customMsg.replace(/\{nombre\}/gi,c.name.split(" ")[0]).replace(/\{empresa\}/gi,c.company||"").replace(/\{vendedor\}/gi,vendedor);
  const openWA=(c)=>{window.open(`https://wa.me/52${(c.phone||"").replace(/\D/g,"")}?text=${encodeURIComponent(buildMsg(c))}`,"_blank");setSent(s=>({...s,[c.id]:true}));};
  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><span className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><MessageCircle size={22} className="text-white"/></span>WhatsApp</h1><p className="text-gray-500 mt-1">Mensajes personalizados</p></div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{maxHeight:"600px"}}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3"><Search size={15} className="absolute left-3 top-3 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
            <div className="flex gap-2">
              <button onClick={()=>setSelected(clients.map(c=>c.id))} className="flex-1 text-xs py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold">Todos</button>
              <button onClick={()=>setSelected([])} className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 text-gray-600 font-semibold">Limpiar</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.map(c=>(
              <div key={c.id} onClick={()=>toggle(c.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${selected.includes(c.id)?"bg-green-50":""}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected.includes(c.id)?"border-green-500 bg-green-500":"border-gray-300"}`}>{selected.includes(c.id)&&<Check size={11} className="text-white"/>}</div>
                <Avatar name={c.name} size={8}/>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{c.name}</div><div className="text-xs text-gray-400">{c.phone}</div></div>
                {sent[c.id]&&<CheckCircle size={14} className="text-green-500"/>}
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-xs text-gray-500">{selected.length} seleccionados</div>
        </div>
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tu nombre</label>
            <input value={vendedor} onChange={e=>setVendedor(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-3">Plantillas</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {WA_TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>{setTemplate(t);setCustomMsg(t.text);}} className={`p-3 rounded-xl border-2 text-xs font-medium text-left ${template.id===t.id?"border-green-500 bg-green-50":"border-gray-200"}`}><div className="text-lg mb-1">{t.icon}</div>{t.name}</button>
              ))}
            </div>
            <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"/>
            <p className="text-xs text-gray-400 mt-1">Variables: <code className="bg-gray-100 px-1 rounded">{"{nombre}"}</code> <code className="bg-gray-100 px-1 rounded">{"{empresa}"}</code> <code className="bg-gray-100 px-1 rounded">{"{vendedor}"}</code></p>
          </div>
          {selected.length>0&&(
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-semibold text-gray-700 mb-3">Enviar</div>
              <div className="space-y-2">
                {clients.filter(c=>selected.includes(c.id)).map(c=>(
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Avatar name={c.name} size={8}/>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{c.name}</div><div className="text-xs text-gray-400 truncate">{buildMsg(c).substring(0,50)}...</div></div>
                    <button onClick={()=>openWA(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sent[c.id]?"bg-green-100 text-green-700":"bg-green-500 text-white hover:bg-green-600"}`}>{sent[c.id]?"✓ Listo":"Enviar"}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailView({ clients }) {
  const [selected, setSelected] = useState([]);
  const [template, setTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [vendedor, setVendedor] = useState("tu nombre");
  const [search, setSearch] = useState("");
  const [sent, setSent] = useState({});
  const toggle=(id)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const filtered=clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.company||"").toLowerCase().includes(search.toLowerCase()));
  const fill=(c)=>({s:subject.replace(/\{nombre\}/gi,c.name.split(" ")[0]).replace(/\{empresa\}/gi,c.company||"").replace(/\{vendedor\}/gi,vendedor),b:body.replace(/\{nombre\}/gi,c.name.split(" ")[0]).replace(/\{empresa\}/gi,c.company||"").replace(/\{vendedor\}/gi,vendedor)});
  const openEmail=(c)=>{const{s,b}=fill(c);window.open(`mailto:${c.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`);setSent(st=>({...st,[c.id]:true}));};
  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><span className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><Mail size={22} className="text-white"/></span>Email</h1><p className="text-gray-500 mt-1">Campañas personalizadas</p></div>
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{maxHeight:"600px"}}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3"><Search size={15} className="absolute left-3 top-3 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
            <div className="flex gap-2">
              <button onClick={()=>setSelected(clients.filter(c=>c.email).map(c=>c.id))} className="flex-1 text-xs py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold">Todos</button>
              <button onClick={()=>setSelected([])} className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 text-gray-600 font-semibold">Limpiar</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.map(c=>(
              <div key={c.id} onClick={()=>c.email&&toggle(c.id)} className={`flex items-center gap-3 px-4 py-3 ${c.email?"cursor-pointer hover:bg-gray-50":"opacity-40"} ${selected.includes(c.id)?"bg-blue-50":""}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected.includes(c.id)?"border-blue-500 bg-blue-500":"border-gray-300"}`}>{selected.includes(c.id)&&<Check size={11} className="text-white"/>}</div>
                <Avatar name={c.name} size={8}/>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{c.name}</div><div className="text-xs text-gray-400 truncate">{c.email||"Sin email"}</div></div>
                {sent[c.id]&&<CheckCircle size={14} className="text-blue-500"/>}
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-xs text-gray-500">{selected.length} seleccionados</div>
        </div>
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tu nombre</label>
            <input value={vendedor} onChange={e=>setVendedor(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-3">Plantillas</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {EMAIL_TEMPLATES.map(t=>(
                <button key={t.id} onClick={()=>{setTemplate(t);setSubject(t.subject);setBody(t.body);}} className={`p-2.5 rounded-xl border-2 text-xs font-medium ${template.id===t.id?"border-blue-500 bg-blue-50":"border-gray-200"}`}><div className="text-lg mb-1">{t.icon}</div>{t.name}</button>
              ))}
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Asunto</label><input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Cuerpo</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"/></div>
            </div>
          </div>
          {selected.length>0&&(
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-semibold text-gray-700 mb-3">Enviar emails</div>
              <div className="space-y-2">
                {clients.filter(c=>selected.includes(c.id)).map(c=>(
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Avatar name={c.name} size={8}/>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{c.name}</div><div className="text-xs text-gray-400 truncate">{c.email}</div></div>
                    <button onClick={()=>openEmail(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${sent[c.id]?"bg-blue-100 text-blue-700":"bg-blue-500 text-white hover:bg-blue-600"}`}>{sent[c.id]?<><Check size={12}/>Enviado</>:<><Send size={12}/>Enviar</>}</button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><ExternalLink size={11}/>Se abrirá tu cliente de correo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function SalesFlow() {
  const [view, setView]       = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  // Cargar clientes desde Firebase
  useEffect(()=>{
    (async()=>{
      try {
        const snap = await getDocs(collection(db, "clients"));
        const data = snap.docs.map(d=>({id:d.id,...d.data()}));
        setClients(data);
      } catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[]);

  const addClient = async(c) => {
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db,"clients"), {...c, created: new Date().toISOString()});
      setClients(prev=>[...prev,{id:docRef.id,...c,created:new Date().toISOString()}]);
    } catch(e){ alert("Error al guardar: "+e.message); }
    setSaving(false);
    setShowAdd(false);
  };

  const updateClient = async(c) => {
    setSaving(true);
    try {
      const {id,...data} = c;
      await updateDoc(doc(db,"clients",id), data);
      setClients(prev=>prev.map(x=>x.id===id?c:x));
    } catch(e){ alert("Error al actualizar: "+e.message); }
    setSaving(false);
    setEditing(null);
  };

  const deleteClient = async(id) => {
    if(!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await deleteDoc(doc(db,"clients",id));
      setClients(prev=>prev.filter(c=>c.id!==id));
    } catch(e){ alert("Error al eliminar: "+e.message); }
  };

  const moveStage = async(id, stage) => {
    try {
      await updateDoc(doc(db,"clients",id), {stage});
      setClients(prev=>prev.map(c=>c.id===id?{...c,stage}:c));
    } catch(e){ console.error(e); }
  };

  if(loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500 text-sm">Conectando con Firebase...</p>
      </div>
    </div>
  );

  const wonValue = clients.filter(c=>c.stage==="Ganado").reduce((s,c)=>s+(c.value||0),0);
  const nav = [
    { id:"dashboard", label:"Dashboard",      icon:Home          },
    { id:"clients",   label:"Clientes (CRM)", icon:Users         },
    { id:"pipeline",  label:"Pipeline",        icon:TrendingUp    },
    { id:"whatsapp",  label:"WhatsApp",        icon:MessageCircle },
    { id:"email",     label:"Email",           icon:Mail          },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{fontFamily:"'Segoe UI', system-ui, sans-serif"}}>
      <div className="w-60 flex-shrink-0 flex flex-col" style={{background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)"}}>
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center"><Zap size={16} className="text-white"/></div>
            <span className="text-white font-bold text-lg">SalesFlow</span>
          </div>
          <div className="text-indigo-300 text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            Firebase activo
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({id,label,icon:Icon})=>(
            <button key={id} onClick={()=>setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view===id?"bg-white text-indigo-900 shadow-md":"text-indigo-200 hover:bg-white hover:bg-opacity-10 hover:text-white"}`}>
              <Icon size={17}/>{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white border-opacity-10">
          <div className="bg-white bg-opacity-10 rounded-xl p-3">
            <div className="text-indigo-200 text-xs mb-1">Ingresos cerrados</div>
            <div className="text-white font-bold text-lg">${wonValue.toLocaleString()}</div>
            <div className="text-indigo-300 text-xs">MXN total</div>
          </div>
          <div className="text-indigo-400 text-xs mt-3 text-center">{clients.length} clientes · v2.0</div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {saving && <div className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm shadow-lg z-50 flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Guardando...</div>}
        {view==="dashboard" && <Dashboard clients={clients} setView={setView}/>}
        {view==="clients"   && <ClientsView clients={clients} onAdd={()=>setShowAdd(true)} onEdit={setEditing} onDelete={deleteClient} onMove={moveStage}/>}
        {view==="pipeline"  && <PipelineView clients={clients} onMove={moveStage} onEdit={setEditing}/>}
        {view==="whatsapp"  && <WhatsAppView clients={clients}/>}
        {view==="email"     && <EmailView clients={clients}/>}
      </div>
      {showAdd && <ClientModal onSave={addClient} onClose={()=>setShowAdd(false)}/>}
      {editing && <ClientModal client={editing} onSave={updateClient} onClose={()=>setEditing(null)}/>}
    </div>
  );
}
