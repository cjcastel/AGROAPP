import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Tractor, 
  LayoutDashboard, 
  ArrowLeft, 
  AlertTriangle, 
  CloudSun, 
  CloudRain, 
  Map, 
  FileText, 
  Layers, 
  LogOut,
  Search,
  Bell,
  Brain,
  Bot,
  Sparkles,
  Send,
  X,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';

// --- INTERFACES DE DATOS ---
interface Plot {
  id?: string;
  sigpac_poligono: number;
  sigpac_recinto: number;
  sigpac_uso: string;
  alias: string;
  superficie_cultivada: number;
  especie: string;
  variedad: string;
  regimen: 'secano' | 'regadio';
}

interface Animal {
  id?: string;
  crotal: string;
  dib: string;
  chip: string;
  fecha_nacimiento: string;
  fecha_alta: string;
  sexo: 'M' | 'H';
  raza: string;
  madre_crotal: string;
  padre_crotal: string;
  clasificacion: string;
  activo: boolean;
}

interface FitoTreatment {
  id?: string;
  parcela_id?: string;
  parcela_alias?: string;
  producto: string;
  num_registro_oficial: string;
  dosis: number;
  unidad_medida: string;
  superficie_tratada: number;
  aplicador_nombre: string;
  fecha_aplicacion: string;
  eficacia: string;
  problema_fitosanitario: string;
}

interface Employee {
  nombre: string;
  rol: string;
  contacto: string;
  coste_hora: number;
  carnets: string[];
  estado: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { nombre: 'Antonio García', rol: 'Encargado General', contacto: '600 123 456', coste_hora: 22.50, carnets: ['Fito Cualificado', 'B+E'], estado: 'Alta' },
  { nombre: 'Luis M. Rodríguez', rol: 'Tractorista / Aplicador', contacto: '611 999 888', coste_hora: 18.00, carnets: ['Fito Básico'], estado: 'Alta' },
  { nombre: 'Elena Sanz', rol: 'Peón Ganadero', contacto: '622 333 444', coste_hora: 15.00, carnets: ['Bienestar Animal'], estado: 'Baja Temporal' }
];

export default function App() {
  // --- ESTADOS DE NAVEGACIÓN ---
  const [view, setView] = useState<'login' | 'global' | 'app-interna'>('login');
  const [mode, setMode] = useState<'agri' | 'ganaderia'>('agri');
  const [activeTab, setActiveTab] = useState<string>('dashboard-local');
  const [farmName, setFarmName] = useState<string>('Finca Los Olivos (Agricultura)');
  
  // --- MODO DE CONEXIÓN (DEMO vs SUPABASE) ---
  const [connectionMode, setConnectionMode] = useState<'demo' | 'supabase'>('demo');
  const [dbStatus, setDbStatus] = useState<string>('Desconectado');
  
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [username, setUsername] = useState('B-12345678');
  const [password, setPassword] = useState('password');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  // --- ESTADOS DE DATOS (RESPONSIVOS & MUTABLES) ---
  const [plots, setPlots] = useState<Plot[]>([
    { sigpac_poligono: 11, sigpac_recinto: 37, sigpac_uso: 'TA', alias: 'P-11-37 (Cebada)', superficie_cultivada: 12.50, especie: 'Cebada', variedad: 'Planet R-2', regimen: 'secano' },
    { sigpac_poligono: 11, sigpac_recinto: 41, sigpac_uso: 'TA', alias: 'P-11-41 (Barbecho)', superficie_cultivada: 4.20, especie: 'Barbecho', variedad: '', regimen: 'secano' },
    { sigpac_poligono: 11, sigpac_recinto: 36, sigpac_uso: 'TA', alias: 'P-11-36 (Trigo)', superficie_cultivada: 8.15, especie: 'Trigo Blando', variedad: 'Bologna', regimen: 'secano' }
  ]);

  const [animals, setAnimals] = useState<Animal[]>([
    { crotal: 'ES000002874561', dib: 'DIB-4561', chip: '985112000014561', fecha_nacimiento: '2021-02-12', fecha_alta: '2021-02-12', sexo: 'H', raza: 'Limusín', madre_crotal: 'ES000001004021', padre_crotal: '', clasificacion: 'Preñada', activo: true },
    { crotal: 'ES000002874562', dib: 'DIB-4562', chip: '985112000014562', fecha_nacimiento: '2021-03-01', fecha_alta: '2021-03-01', sexo: 'H', raza: 'Limusín', madre_crotal: 'ES000001004022', padre_crotal: '', clasificacion: 'Vacía', activo: true },
    { crotal: 'ES000002879999', dib: 'DIB-9999', chip: '985112000019999', fecha_nacimiento: '2026-02-15', fecha_alta: '2026-02-15', sexo: 'M', raza: 'Cruzado', madre_crotal: 'ES000002874561', padre_crotal: '', clasificacion: 'Lactante', activo: true }
  ]);

  const [fitoTreatments, setFitoTreatments] = useState<FitoTreatment[]>([
    { fecha_aplicacion: '2025-10-15', producto: 'ROUNDUP ULTRA PLUS', num_registro_oficial: 'ES-00123', dosis: 2.0, unidad_medida: 'L/ha', superficie_tratada: 12.5, aplicador_nombre: 'Luis M. Rodríguez', eficacia: 'Alta', problema_fitosanitario: 'Malas hierbas antes siembra' },
    { fecha_aplicacion: '2025-11-20', producto: 'FUNGICIDA COBRE', num_registro_oficial: 'ES-54321', dosis: 1.0, unidad_medida: 'kg/ha', superficie_tratada: 4.2, aplicador_nombre: 'Luis M. Rodríguez', eficacia: 'Buena', problema_fitosanitario: 'Prevención hongos' }
  ]);

  // --- FORMULARIOS DE ALTAS ---
  const [newPlot, setNewPlot] = useState<Plot>({ sigpac_poligono: 0, sigpac_recinto: 0, sigpac_uso: 'TA', alias: '', superficie_cultivada: 0, especie: '', variedad: '', regimen: 'secano' });
  const [newAnimal, setNewAnimal] = useState<Animal>({ crotal: '', dib: '', chip: '', fecha_nacimiento: '', fecha_alta: new Date().toISOString().split('T')[0], sexo: 'H', raza: '', madre_crotal: '', padre_crotal: '', clasificacion: 'Vacía', activo: true });
  const [newFito, setNewFito] = useState<FitoTreatment>({ fecha_aplicacion: new Date().toISOString().split('T')[0], producto: '', num_registro_oficial: '', dosis: 0, unidad_medida: 'L/ha', superficie_tratada: 0, aplicador_nombre: 'Luis M. Rodríguez', eficacia: 'Pendiente',  problema_fitosanitario: '' });

  // --- ESTADOS DE CARACTERÍSTICAS DE IA ---
  // AEMET
  const [weatherData, setWeatherData] = useState<any>(null);

  // SIEX Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'bot' | 'user'; content: string }>>([
    {
      role: 'bot',
      content: '¡Hola! Soy tu asesor legal **AgroApp SIEX**. Puedo asistirte en el cumplimiento del Cuaderno Digital (CUE), normativas de la PAC 2026, límites de abonado nitrogenado en zonas vulnerables, y regulaciones del MAPA. ¿Qué te gustaría consultar hoy?'
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Diagnóstico de Plagas
  const [selectedCrop, setSelectedCrop] = useState('olivar');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosed, setDiagnosed] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  // --- EFECTO DE CARGA DE CLIMA (AEMET) ---
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('./aemet_data.json');
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error('Error al cargar datos de AEMET:', err);
      }
    };
    fetchWeather();
  }, []);

  // --- SEGUIMIENTO DE SUPABASE ---
  useEffect(() => {
    if (connectionMode === 'supabase') {
      testSupabaseConnection();
    } else {
      setDbStatus('Local Demo');
    }
  }, [connectionMode]);

  const testSupabaseConnection = async () => {
    try {
      setDbStatus('Conectando...');
      const { error } = await supabase.from('perfiles').select('*').limit(1);
      if (error) {
        setDbStatus('Error: ' + error.message);
      } else {
        setDbStatus('Conectado a Supabase');
        fetchSupabaseData();
      }
    } catch (e: any) {
      setDbStatus('Error: ' + e.message);
    }
  };

  const fetchSupabaseData = async () => {
    // Buscar parcelas
    const { data: dbPlots } = await supabase.from('parcelas').select('*');
    if (dbPlots && dbPlots.length > 0) setPlots(dbPlots);

    // Buscar animales
    const { data: dbAnimals } = await supabase.from('animales').select('*');
    if (dbAnimals && dbAnimals.length > 0) setAnimals(dbAnimals);

    // Buscar tratamientos
    const { data: dbFitos } = await supabase.from('tratamientos_fitosanitarios').select('*');
    if (dbFitos && dbFitos.length > 0) {
      setFitoTreatments(dbFitos.map(f => ({
        fecha_aplicacion: f.fecha_aplicacion,
        producto: f.producto,
        num_registro_oficial: f.num_registro_oficial,
        dosis: f.dosis,
        unidad_medida: f.unidad_medida,
        superficie_tratada: f.superficie_tratada,
        aplicador_nombre: f.aplicador_nombre,
        eficacia: f.eficacia || 'Buena',
        problema_fitosanitario: f.problema_fitosanitario
      })));
    }
  };

  // --- CONTROLADOR LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    if (connectionMode === 'supabase') {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.includes('@') ? username : `${username}@agroapp.es`,
          password: password
        });

        if (error) {
          setAuthError(error.message);
        } else {
          setSessionUser(data.user);
          setView('global');
        }
      } catch (err: any) {
        setAuthError(err.message || 'Error en la conexión.');
      }
    } else {
      // Demo Mode Auto-Login
      setTimeout(() => {
        setView('global');
        setLoading(false);
      }, 500);
      return;
    }
    setLoading(false);
  };

  // --- ALTAS ---
  const handleAddPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlot.alias || !newPlot.especie || newPlot.superficie_cultivada <= 0) return;

    if (connectionMode === 'supabase') {
      const { error } = await supabase.from('parcelas').insert([{
        explotacion_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        tenant_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        sigpac_poligono: newPlot.sigpac_poligono,
        sigpac_recinto: newPlot.sigpac_recinto,
        sigpac_uso: newPlot.sigpac_uso,
        alias: newPlot.alias,
        superficie_cultivada: newPlot.superficie_cultivada,
        especie: newPlot.especie,
        variedad: newPlot.variedad,
        regimen: newPlot.regimen
      }]);
      if (error) {
        alert('Error al guardar en Supabase: ' + error.message);
      } else {
        alert('Parcela guardada con éxito en Supabase!');
        fetchSupabaseData();
      }
    } else {
      setPlots([...plots, newPlot]);
      alert('Parcela agregada (Modo Demo Local)');
    }
    setNewPlot({ sigpac_poligono: 0, sigpac_recinto: 0, sigpac_uso: 'TA', alias: '', superficie_cultivada: 0, especie: '', variedad: '', regimen: 'secano' });
  };

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimal.crotal || !newAnimal.raza) return;

    if (connectionMode === 'supabase') {
      const { error } = await supabase.from('animales').insert([{
        explotacion_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        tenant_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        crotal: newAnimal.crotal,
        dib: newAnimal.dib,
        chip: newAnimal.chip,
        fecha_nacimiento: newAnimal.fecha_nacimiento,
        fecha_alta: newAnimal.fecha_alta,
        sexo: newAnimal.sexo,
        raza: newAnimal.raza,
        madre_crotal: newAnimal.madre_crotal,
        padre_crotal: newAnimal.padre_crotal,
        clasificacion: newAnimal.clasificacion,
        activo: true
      }]);
      if (error) {
        alert('Error en Supabase: ' + error.message);
      } else {
        alert('Animal registrado en Supabase!');
        fetchSupabaseData();
      }
    } else {
      setAnimals([...animals, newAnimal]);
      alert('Animal registrado (Modo Demo Local)');
    }
    setNewAnimal({ crotal: '', dib: '', chip: '', fecha_nacimiento: '', fecha_alta: new Date().toISOString().split('T')[0], sexo: 'H', raza: '', madre_crotal: '', padre_crotal: '', clasificacion: 'Vacía', activo: true });
  };

  const handleAddFito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFito.producto || !newFito.problema_fitosanitario || newFito.dosis <= 0) return;

    if (connectionMode === 'supabase') {
      const { error } = await supabase.from('tratamientos_fitosanitarios').insert([{
        parcela_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        tenant_id: 'd9b73489-08a8-4c8d-8fe0-c5e3f538e1a8',
        producto: newFito.producto,
        num_registro_oficial: newFito.num_registro_oficial,
        dosis: newFito.dosis,
        unidad_medida: newFito.unidad_medida,
        superficie_tratada: newFito.superficie_tratada,
        aplicador_nombre: newFito.aplicador_nombre,
        fecha_aplicacion: newFito.fecha_aplicacion,
        eficacia: newFito.eficacia,
        problema_fitosanitario: newFito.problema_fitosanitario
      }]);
      if (error) {
        alert('Error en Supabase: ' + error.message);
      } else {
        alert('Tratamiento registrado en Supabase!');
        fetchSupabaseData();
      }
    } else {
      setFitoTreatments([...fitoTreatments, newFito]);
      alert('Tratamiento fitosanitario registrado (Modo Demo Local)');
    }
    setNewFito({ fecha_aplicacion: new Date().toISOString().split('T')[0], producto: '', num_registro_oficial: '', dosis: 0, unidad_medida: 'L/ha', superficie_tratada: 0, aplicador_nombre: 'Luis M. Rodríguez', eficacia: 'Pendiente', problema_fitosanitario: '' });
  };

  // --- SELECCIONAR EXPLOTACIÓN ---
  const enterFarm = (farmType: 'agri' | 'ganaderia', name: string) => {
    setMode(farmType);
    setFarmName(name);
    setView('app-interna');
    setActiveTab('dashboard-local');
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setSessionUser(null);
    setView('login');
  };

  // --- CONTROLADOR CHATBOT COMPLIANCE SIEX ---
  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    // Agregar mensaje del usuario
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: messageText }];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      let reply = '';
      const text = messageText.toLowerCase();

      if (text.includes('siex') || text.includes('sistema de informacion')) {
        reply = 'El **SIEX (Sistema de Información de Explotaciones Agrícolas)** es el registro unificado del Ministerio de Agricultura. En la campaña actual, es obligatorio registrar todo cultivo, superficie catastral, y tratamientos. Los titulares deben mantener el Cuaderno Digital (CUE) sincronizado. Con AgroApp, puedes generar el XML directamente y subirlo a la plataforma autonómica sin trámites manuales.';
      } else if (text.includes('nitrato') || text.includes('abono') || text.includes('fertiliza') || text.includes('nitrogeno')) {
        reply = 'Según el Real Decreto 1051/2022 de nutrición sostenible de suelos:\n1. **Límite general**: En zonas vulnerables a la contaminación por nitratos, la dosis máxima permitida es de **170 UF/ha** de Nitrógeno orgánico.\n2. **Plan de abonado**: Debe estar redactado por un asesor técnico acreditado si la finca supera las 10 ha de secano o 5 ha de regadío.\n3. **Registro obligatorio**: Toda aplicación de abono químico u orgánico debe anotarse en un plazo de **1 mes** desde su ejecución.';
      } else if (text.includes('plazo') || text.includes('tiempo') || text.includes('registrar') || text.includes('fito')) {
        reply = 'Para tratamientos fitosanitarios:\n- El plazo oficial para registrar el tratamiento en el Cuaderno Digital de Explotación (CUE) es de **un mes** (30 días naturales) desde la aplicación.\n- Recuerda que debe realizarlo un aplicador con carnet ROPO vigente (Básico o Cualificado) y el producto debe estar registrado en el Registro Oficial de Productos Fitosanitarios (RECOP) del MAPA.';
      } else if (text.includes('ternero') || text.includes('crotal') || text.includes('nacimiento') || text.includes('rega')) {
        reply = 'El registro de nacimientos en el censo ganadero **REGA** debe comunicarse en un plazo máximo de **20 días naturales** desde el nacimiento. Se debe asignar un crotal oficial del stock autorizado por la OCA correspondiente y rellenar el Documento de Identificación Bovino (DIB).';
      } else if (text.includes('hola') || text.includes('buenas')) {
        reply = '¡Hola! ¿En qué puedo ayudarte hoy sobre cumplimiento legal, normativas de la PAC, Cuaderno Digital o sensores IoT?';
      } else {
        reply = 'Entendido. Con respecto a la normativa de la PAC 2026 y la condicionalidad reforzada, todas las explotaciones agrarias en España deben contar con un Cuaderno de Campo Digital (CUE). Te recomiendo verificar que:\n\n- Tus parcelas SIGPAC coincidan exactamente con la declaración de la PAC.\n- Dispongas de los carnets de aplicador (ROPO) en vigor para el personal registrado.\n- Registres las dosis y el número de registro oficial del MAPA para cada fitosanitario utilizado. \n\n¿Quieres que revisemos algún parámetro específico de tu explotación?';
      }

      setChatMessages(prev => [...prev, { role: 'bot' as const, content: reply }]);
      setIsChatTyping(false);
    }, 1000);
  };

  // --- SIMULACIÓN DIAGNÓSTICO PLAGAS CON IA ---
  const runPestDiagnosis = () => {
    if (!uploadedImage) {
      alert('Por favor, selecciona una imagen de muestra para analizar.');
      return;
    }
    setDiagnosing(true);
    setDiagnosed(false);
    setScanProgress(0);
    setScanStatusText('Iniciando escáner de visión artificial...');

    const steps = [
      { progress: 15, text: 'Cargando imagen en canal de análisis...' },
      { progress: 40, text: 'Analizando morfología foliar y decoloración...' },
      { progress: 65, text: 'Comparando con base de datos del MAPA (2026)...' },
      { progress: 90, text: 'Filtrando tratamientos ecológicos autorizados...' },
      { progress: 100, text: 'Diagnóstico completado.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setScanProgress(step.progress);
        setScanStatusText(step.text);
        if (step.progress === 100) {
          setDiagnosing(false);
          setDiagnosed(true);
          
          let result: any = {};
          if (selectedCrop === 'olivar') {
            result = {
              plaga: 'Mosca del Olivo (Bactrocera oleae)',
              cientifico: 'Bactrocera oleae',
              confianza: '96.2%',
              gravedad: 'Alta',
              gravedadColor: 'var(--color-danger)',
              sintomas: 'Picaduras de puesta en el fruto, galerías excavadas por larvas, caída prematura del fruto y pérdida de calidad de aceite.',
              tratamientoQuimico: 'Deltametrina 2.5% (Nº Reg: 24.153) - Dosis: 0.3-0.5 L/ha.',
              tratamientoBiologico: 'Trampas de atracción quimio-trópica (DAP) o pulverización con Arcilla de Caolín al 3-5% como barrera física.',
              preventivo: 'Fomentar la fauna útil (parasitoides Opius concolor), recogida selectiva de frutos caídos y colocación anticipada de mosqueros a principios de verano.'
            };
          } else if (selectedCrop === 'trigo' || selectedCrop === 'cebada') {
            result = {
              plaga: 'Roya Amarilla (Puccinia striiformis)',
              cientifico: 'Puccinia striiformis',
              confianza: '93.5%',
              gravedad: 'Media-Alta',
              gravedadColor: '#D35400',
              sintomas: 'Pústulas amarillentas o anaranjadas dispuestas en líneas longitudinales sobre las hojas, interfiriendo la fotosíntesis y mermando el peso del grano.',
              tratamientoQuimico: 'Tebuconazol 25% (Nº Reg: 18.995) - Dosis: 1 L/ha.',
              tratamientoBiologico: 'Aplicaciones preventivas de Bacillus subtilis o extracto de cola de caballo (Equisetum arvense).',
              preventivo: 'Evitar exceso de abonado nitrogenado de cobertura, elegir variedades resistentes y mantener rotaciones de cultivo para romper ciclos.'
            };
          } else {
            result = {
              plaga: 'Mildiu (Plasmopara viticola)',
              cientifico: 'Plasmopara viticola',
              confianza: '91.8%',
              gravedad: 'Media',
              gravedadColor: '#F1C40F',
              sintomas: 'Manchas translúcidas en el haz de la hoja conocidas como "manchas de aceite" y una pelusilla blanquecina en el envés bajo condiciones de alta humedad.',
              tratamientoQuimico: 'Sulfato de Cobre o Hidróxido Cúprico (Nº Reg: 12.001) - Dosis: 1.5-2.0 kg/ha.',
              tratamientoBiologico: 'Tratamientos repetidos con sales de cobre en bajas dosis y extractos de ortiga.',
              preventivo: 'Podas en verde para facilitar aireación foliar, control de deshojado precoz y evitar encharcamientos del terreno.'
            };
          }
          setDiagnosisResult(result);
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. ACCESO / LOGIN VIEW */}
      {view === 'login' && (
        <div className="login-wrapper">
          <div className="card login-box">
            <div className="flex" style={{ justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
              <Tractor size={32} style={{ color: 'var(--color-agri)' }} />
              <h2 style={{ color: 'var(--color-admin)', margin: 0, fontSize: '26px' }}>AgroApp</h2>
            </div>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#7F8C8D', marginBottom: '25px' }}>
              Gestión Integral & Compliance Oficial
            </p>

            {/* Selector de Conexión */}
            <div className="flex" style={{ background: '#F2F4F4', padding: '5px', borderRadius: '6px', marginBottom: '20px' }}>
              <button 
                type="button"
                className="btn w-full" 
                style={{ 
                  background: connectionMode === 'demo' ? 'white' : 'transparent', 
                  color: connectionMode === 'demo' ? 'var(--color-admin)' : '#7F8C8D',
                  padding: '6px 10px',
                  fontSize: '11px',
                  boxShadow: connectionMode === 'demo' ? 'var(--shadow)' : 'none'
                }}
                onClick={() => setConnectionMode('demo')}
              >
                Modo Demo Local
              </button>
              <button 
                type="button"
                className="btn w-full" 
                style={{ 
                  background: connectionMode === 'supabase' ? 'white' : 'transparent', 
                  color: connectionMode === 'supabase' ? 'var(--color-admin)' : '#7F8C8D',
                  padding: '6px 10px',
                  fontSize: '11px',
                  boxShadow: connectionMode === 'supabase' ? 'var(--shadow)' : 'none'
                }}
                onClick={() => setConnectionMode('supabase')}
              >
                Supabase Auth
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <span className={`badge ${dbStatus.startsWith('Error') ? 'bg-danger' : dbStatus.startsWith('Conectado') ? 'bg-success' : 'bg-warning'}`}>
                DB: {dbStatus}
              </span>
            </div>

            {authError && (
              <div style={{ background: '#FDEDEC', color: 'var(--color-danger)', padding: '10px', borderRadius: '4px', fontSize: '12px', marginBottom: '15px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                <AlertTriangle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label>Usuario / Email / NIF</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: B-12345678" 
                  required
                />
              </div>
              <div className="mb-3" style={{ marginBottom: '25px' }}>
                <label>Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '11px', color: '#95A5A6' }}>
              v3.6.0 | Cumple normativa CUE/SIEX España 2026
            </p>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD GLOBAL VIEW */}
      {view === 'global' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <header style={{ background: 'white', padding: '15px 30px', borderBottom: '1px solid #ECF0F1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex" style={{ gap: '10px' }}>
              <Tractor size={24} style={{ color: 'var(--color-agri)' }} />
              <h1 style={{ fontSize: '20px', color: 'var(--color-admin)', margin: 0 }}>
                AgroApp <span style={{ fontWeight: 300 }}>| Vista Global</span>
              </h1>
            </div>
            <div className="flex">
              <span className="badge bg-success" style={{ marginRight: '15px' }}>Modo: {connectionMode === 'supabase' ? 'Supabase Prod' : 'Demo Local'}</span>
              <label style={{ margin: 0, marginRight: '10px' }}>Campaña:</label>
              <select style={{ width: '130px', margin: 0, padding: '5px' }}>
                <option>2025-2026</option>
                <option>2024-2025</option>
              </select>
              <button onClick={handleLogout} className="btn btn-outline" style={{ marginLeft: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                <LogOut size={14} /> Salir
              </button>
            </div>
          </header>

          <div className="container" style={{ flex: 1, padding: '30px 20px' }}>
            <div className="grid-2">
              
              {/* Box Agricultura */}
              <div className="card" style={{ borderTop: '4px solid var(--color-agri)' }}>
                <div className="card-header" style={{ color: 'var(--color-agri)' }}>AGRICULTURA (Superficies/Usos)</div>
                <div style={{ marginBottom: '20px' }}>
                  <div className="bar-chart-container"><span className="bar-label">Trigo</span><div className="bar-track"><div className="bar-fill bg-trigo" style={{ width: '90%' }}>220 ha</div></div></div>
                  <div className="bar-chart-container"><span className="bar-label">Cebada</span><div className="bar-track"><div className="bar-fill bg-cebada" style={{ width: '70%' }}>180 ha</div></div></div>
                  <div className="bar-chart-container"><span className="bar-label">Barbecho</span><div className="bar-track"><div className="bar-fill bg-barbecho" style={{ width: '40%' }}>100 ha</div></div></div>
                  <div className="bar-chart-container"><span className="bar-label">B. Cubierta</span><div className="bar-track"><div className="bar-fill bg-barbecho-c" style={{ width: '60%' }}>140 ha</div></div></div>
                  <div className="bar-chart-container"><span className="bar-label">Pasto</span><div className="bar-track"><div className="bar-fill bg-pasto" style={{ width: '20%' }}>50 ha</div></div></div>
                </div>
                
                <h4 style={{ color: 'var(--color-danger)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlertTriangle size={16} /> TAREAS URGENTES
                </h4>
                <table>
                  <tbody>
                    <tr><td>Validar Cuaderno de Campo (Fincas Toledo)</td><td style={{ textAlign: 'right' }}><span className="badge bg-danger">Pendiente</span></td></tr>
                    <tr><td>Ajustar plan de siembra Cebada</td><td style={{ textAlign: 'right' }}><span className="badge bg-warning">En Curso</span></td></tr>
                    <tr><td>Cargar analíticas de suelo zona norte</td><td style={{ textAlign: 'right' }}><span className="badge bg-success">Listo</span></td></tr>
                  </tbody>
                </table>
              </div>

              {/* Box Ganadería */}
              <div className="card" style={{ borderTop: '4px solid var(--color-gana)' }}>
                <div className="card-header" style={{ color: 'var(--color-gana)' }}>GANADERÍA (Censo & Ciclos)</div>
                <div className="grid-2">
                  <div style={{ textAlign: 'center' }}>
                    <h5 style={{ fontSize: '12px', color: '#7F8C8D' }}>CENSO ACTUAL</h5>
                    <div className="pie-chart" style={{ marginTop: '15px' }}>
                      <div className="pie-hole">{animals.length * 10 + 290} Cab</div>
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--color-gana)' }}>● Vacas</span>
                      <span style={{ color: '#2980B9' }}>● Recría</span>
                      <span style={{ color: 'var(--color-agri)' }}>● Toros</span>
                    </div>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '12px', color: '#7F8C8D' }}>EVOLUCIÓN GANADERA</h5>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '15px', paddingBottom: '5px', borderBottom: '1px solid #BDC3C7', justifyContent: 'center' }}>
                      <div style={{ width: '35px', background: '#2C3E50', height: '65%', borderRadius: '4px 4px 0 0' }}></div>
                      <div style={{ width: '35px', background: '#E67E22', height: '85%', borderRadius: '4px 4px 0 0' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '11px', marginTop: '5px' }}>
                      <span>2025</span><span>2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila Financiera */}
            <div className="card mt-20" style={{ borderTop: '4px solid var(--color-admin)' }}>
              <div className="grid-3">
                <div>
                  <h5 style={{ color: 'var(--color-admin)', margin: 0 }}>INGRESOS TOTALES 2025/26</h5>
                  <div style={{ height: '10px', background: '#eee', marginTop: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', background: '#2ECC71', height: '100%' }}></div>
                  </div>
                  <small style={{ color: '#7F8C8D', display: 'block', marginTop: '4px' }}>450.000€ (Proyectado)</small>
                </div>
                <div>
                  <h5 style={{ color: 'var(--color-danger)', margin: 0 }}>GASTOS TOTALES 2025/26</h5>
                  <div style={{ height: '10px', background: '#eee', marginTop: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', background: '#C0392B', height: '100%' }}></div>
                  </div>
                  <small style={{ color: '#7F8C8D', display: 'block', marginTop: '4px' }}>120.000€ (Ejecutado)</small>
                </div>
                <div>
                  <h5 style={{ color: 'var(--color-admin)', margin: 0 }}>ESTADO DE FACTURACIÓN</h5>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <span className="badge bg-info">Emitidas: 12</span>
                    <span className="badge bg-warning">Cobros Pend.: 4</span>
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ margin: '40px 0', border: 0, borderTop: '1px solid #ECF0F1' }} />

            <h2 style={{ marginBottom: '20px', color: 'var(--color-admin)' }}>Mis Explotaciones</h2>
            <div className="grid-4">
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px' }}>
                <div>
                  <span className="badge bg-success" style={{ marginBottom: '10px', display: 'inline-block' }}>Agricultura</span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Finca Los Olivos</h3>
                  <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Toledo | Olivar y Cereal | 450 ha</p>
                </div>
                <button 
                  onClick={() => enterFarm('agri', 'Finca Los Olivos (Agricultura)')} 
                  className="btn btn-agri w-full"
                >
                  Entrar
                </button>
              </div>
              
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px' }}>
                <div>
                  <span className="badge bg-warning" style={{ marginBottom: '10px', display: 'inline-block' }}>Ganadería</span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Dehesa El Roble</h3>
                  <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Extremadura | Vacuno Carne | ES100010</p>
                </div>
                <button 
                  onClick={() => enterFarm('ganaderia', 'Dehesa El Roble (Ganadería)')} 
                  className="btn btn-gana w-full"
                >
                  Entrar
                </button>
              </div>

              <div className="card" style={{ opacity: 0.6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px' }}>
                <div>
                  <span className="badge bg-success" style={{ marginBottom: '10px', display: 'inline-block' }}>Agricultura</span>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Viñedos del Sur</h3>
                  <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Ciudad Real | Vid | 120 ha</p>
                </div>
                <button className="btn btn-outline w-full" disabled style={{ cursor: 'not-allowed' }}>
                  No Habilitado
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. APP INTERNA VIEW (CON PESTAÑAS) */}
      {view === 'app-interna' && (
        <div className="app-container" style={{ flex: 1 }}>
          
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <div className="flex" style={{ gap: '8px', fontSize: '18px' }}>
                <Tractor size={20} />
                <span>AgroApp</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '5px', opacity: 0.8 }}>
                {farmName}
              </div>
            </div>

            <div 
              className={`nav-item ${activeTab === 'dashboard-local' ? (mode === 'ganaderia' ? 'active-gana' : 'active') : ''}`}
              onClick={() => { setActiveTab('dashboard-local'); }}
            >
              <LayoutDashboard size={16} /> Resumen Explotación
            </div>

            <div className="nav-group-title">Datos Maestros</div>
            <div 
              className={`nav-item ${activeTab === 'datos-general' ? (mode === 'ganaderia' ? 'active-gana' : 'active') : ''}`}
              onClick={() => { setActiveTab('datos-general'); }}
            >
              Explotación Ficha
            </div>
            <div 
              className={`nav-item ${activeTab === 'datos-empleados' ? (mode === 'ganaderia' ? 'active-gana' : 'active') : ''}`}
              onClick={() => { setActiveTab('datos-empleados'); }}
            >
              Empleados
            </div>
            <div 
              className={`nav-item ${activeTab === 'datos-maquinaria' ? (mode === 'ganaderia' ? 'active-gana' : 'active') : ''}`}
              onClick={() => { setActiveTab('datos-maquinaria'); }}
            >
              Maquinaria
            </div>

            {/* Módulos de Agricultura */}
            {mode === 'agri' && (
              <>
                <div className="nav-group-title" style={{ color: 'var(--color-agri)' }}>Módulo Agrícola</div>
                <div 
                  className={`nav-item ${activeTab === 'parcelas' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('parcelas'); }}
                >
                  Parcelas (SIGPAC)
                </div>
                <div 
                  className={`nav-item ${activeTab === 'tratamientos' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('tratamientos'); }}
                >
                  Tratamientos (Fito)
                </div>
                <div 
                  className={`nav-item ${activeTab === 'diagnostico-ia' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('diagnostico-ia'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Brain size={16} /> Diagnóstico IA (Plagas)
                </div>
                <div 
                  className={`nav-item ${activeTab === 'fertilizacion' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('fertilizacion'); }}
                >
                  Fertilización
                </div>
                <div 
                  className={`nav-item ${activeTab === 'informes-agri' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('informes-agri'); }}
                >
                  Cuaderno Digital (CUE)
                </div>
              </>
            )}

            {/* Módulos de Ganadería */}
            {mode === 'ganaderia' && (
              <>
                <div className="nav-group-title" style={{ color: 'var(--color-gana)' }}>Módulo Ganadero</div>
                <div 
                  className={`nav-item ${activeTab === 'censo' ? 'active-gana' : ''}`}
                  onClick={() => { setActiveTab('censo'); }}
                >
                  Censo Vivo
                </div>
                <div 
                  className={`nav-item ${activeTab === 'identificacion' ? 'active-gana' : ''}`}
                  onClick={() => { setActiveTab('identificacion'); }}
                >
                  Identificación (Crotales)
                </div>
                <div 
                  className={`nav-item ${activeTab === 'actividad-gana' ? 'active-gana' : ''}`}
                  onClick={() => { setActiveTab('actividad-gana'); }}
                >
                  Movimientos (Libro)
                </div>
              </>
            )}

            <div className="nav-group-title">Administración</div>
            <div 
              className={`nav-item ${activeTab === 'iot' ? (mode === 'ganaderia' ? 'active-gana' : 'active') : ''}`}
              onClick={() => { setActiveTab('iot'); }}
            >
              Sensores IoT
            </div>

            {/* Botón Volver */}
            <div style={{ marginTop: 'auto', padding: '20px' }}>
              <button 
                onClick={() => setView('global')} 
                className="btn btn-outline w-full" 
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <ArrowLeft size={14} /> Volver Global
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="main-content">
            
            {/* Header del panel */}
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', color: 'var(--color-admin)', margin: 0 }}>
                {activeTab === 'dashboard-local' && 'Resumen de Explotación'}
                {activeTab === 'datos-general' && 'Datos Generales de la Explotación'}
                {activeTab === 'datos-empleados' && 'Registro de Personal'}
                {activeTab === 'datos-maquinaria' && 'Parque de Maquinaria y Equipos'}
                {activeTab === 'parcelas' && 'Parcelas Integradas (SIGPAC)'}
                {activeTab === 'tratamientos' && 'Registro de Tratamientos Fitosanitarios'}
                {activeTab === 'diagnostico-ia' && 'Diagnóstico Visual de Plagas (Gemini IA)'}
                {activeTab === 'fertilizacion' && 'Plan de Abonado y Fertilización'}
                {activeTab === 'informes-agri' && 'Compliance: Cuaderno de Campo Digital'}
                {activeTab === 'censo' && 'Registro de Censo Ganadero'}
                {activeTab === 'identificacion' && 'Stock y Asignación de Crotales'}
                {activeTab === 'actividad-gana' && 'Libro Oficial de Registro Ganadero (REGA)'}
                {activeTab === 'iot' && 'Red de Telemetría y Sensores IoT'}
              </h2>
              <div className="flex" style={{ gap: '15px' }}>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#7F8C8D' }}>
                  Usuario: <strong>{sessionUser ? sessionUser.email : 'Juan Agricultor (Demo)'}</strong><br />
                  Perfil: <strong>Administrador (Tenant)</strong>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                  <Bell size={14} /> <span className="badge bg-danger" style={{ padding: '2px 5px', fontSize: '9px' }}>3</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: 1. RESUMEN LOCAL */}
            {activeTab === 'dashboard-local' && (
              <div className="flex-col" style={{ gap: '20px' }}>
                <div style={{ background: '#FDEDEC', borderLeft: '4px solid var(--color-danger)', padding: '15px', borderRadius: '4px' }}>
                  <h4 style={{ color: 'var(--color-danger)', margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Acciones Críticas de Compliance y Operación
                  </h4>
                  <ul style={{ marginLeft: '20px', fontSize: '12px', color: 'var(--color-text)', lineHeight: '1.6' }}>
                    {mode === 'agri' ? (
                      <li><strong>SIGPAC:</strong> 2 parcelas con solape de linderos según catastro pendientes de validación.</li>
                    ) : (
                      <li><strong>Sanidad:</strong> Campaña oficial de saneamiento de Tuberculosis programada para el 15 de julio.</li>
                    )}
                    <li><strong>Facturación:</strong> Cargar 3 facturas de compras de combustible para deducción fiscal de IVA.</li>
                  </ul>
                </div>

                <div className="grid-3">
                  {/* Clima AEMET */}
                  <div className="card">
                    <div className="card-header">Meteorología (AEMET)</div>
                    <div className="flex" style={{ justifyContent: 'center', gap: '25px', padding: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <CloudSun size={36} style={{ color: '#F39C12' }} />
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>18°C</div>
                        <small style={{ color: '#7F8C8D' }}>Hoy</small>
                      </div>
                      <div style={{ textAlign: 'center', opacity: 0.6 }}>
                        <CloudRain size={28} style={{ color: '#3498DB' }} />
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>12°C</div>
                        <small style={{ color: '#7F8C8D' }}>Mañana</small>
                      </div>
                    </div>
                    <div style={{ marginTop: '15px', fontSize: '11px', background: '#EBF5FB', padding: '8px', borderRadius: '4px', color: '#1B4F72' }}>
                      💧 Previsión de lluvia: <strong>5.2 mm</strong>. Se aconseja pausar los riegos programados.
                    </div>
                  </div>

                  {/* Tareas */}
                  <div className="card">
                    <div className="card-header">Plan de Trabajo Activo</div>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="flex" style={{ gap: '8px' }}>
                        <input type="checkbox" defaultChecked />
                        <span><span className="badge bg-danger">URGENTE</span> Reparar vallado sector norte</span>
                      </div>
                      <div className="flex" style={{ gap: '8px' }}>
                        <input type="checkbox" />
                        <span>Revisión de niveles e ITV Tractor John Deere 6155M</span>
                      </div>
                      <div className="flex" style={{ gap: '8px' }}>
                        <input type="checkbox" />
                        <span>Revisar existencias de fertilizantes en almacén</span>
                      </div>
                    </div>
                  </div>

                  {/* Acceso Reciente */}
                  <div className="card">
                    <div className="card-header">Últimas Acciones Registradas</div>
                    <ul className="timeline" style={{ fontSize: '11px' }}>
                      <li className="timeline-item">
                        <strong>Veterinario María López</strong><br />
                        <span style={{ color: '#7F8C8D' }}>Hoy 09:30 - Registro de Tratamiento</span>
                      </li>
                      <li className="timeline-item">
                        <strong>Admin Carlos</strong><br />
                        <span style={{ color: '#7F8C8D' }}>Ayer 18:45 - Carga de facturas de pienso</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. FICHA GENERAL */}
            {activeTab === 'datos-general' && (
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Ficha Registral de la Explotación</span>
                  <button className="btn btn-primary" onClick={() => alert('Datos guardados localmente')} style={{ fontSize: '11px' }}>
                    Guardar Ficha
                  </button>
                </div>
                <form style={{ marginTop: '15px' }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Titular Legal de la Explotación</label>
                      <input type="text" defaultValue="AGROPECUARIA EL MANANTIAL S.L." />
                    </div>
                    <div className="form-group">
                      <label>C.I.F. / N.I.F.</label>
                      <input type="text" defaultValue="B-45889900" readOnly style={{ background: '#EAEDED', cursor: 'not-allowed' }} />
                    </div>
                  </div>
                  <div className="grid-3" style={{ marginTop: '15px' }}>
                    <div className="form-group">
                      <label>Código REGA Explotación</label>
                      <input type="text" defaultValue="ES450010000293" />
                    </div>
                    <div className="form-group">
                      <label>Referencia Catastral</label>
                      <input type="text" defaultValue="45002A011000370000KY" />
                    </div>
                    <div className="form-group">
                      <label>Calificación Zoosanitaria (REGA)</label>
                      <select defaultValue="Indemne">
                        <option value="Indemne">Indemne Oficialmente (T3/B4)</option>
                        <option value="Saneamiento">Saneamiento Pendiente</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Dirección Física de la Sede</label>
                    <input type="text" defaultValue="Polígono 11, Parcela 37, Camino de la Vega s/n, 45000 Toledo" />
                  </div>
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Observaciones Generales</label>
                    <textarea rows={3} defaultValue="Explotación mixta dedicada a la ganadería de bovino en pastos extensivos y cultivo rotativo de secano. Cobertura del CUE al día." />
                  </div>
                </form>
              </div>
            )}

            {/* TAB CONTENT: 3. EMPLEADOS */}
            {activeTab === 'datos-empleados' && (
              <div className="flex-col" style={{ gap: '15px' }}>
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <div className="flex" style={{ background: 'white', padding: '4px 10px', borderRadius: '4px', border: '1px solid #BDC3C7', width: '300px' }}>
                    <Search size={14} style={{ color: '#7F8C8D' }} />
                    <input type="text" placeholder="Filtrar empleados..." style={{ border: 'none', margin: 0, padding: '4px' }} />
                  </div>
                  <button className="btn btn-primary" onClick={() => alert('Formulario de alta de personal')}>+ Registrar Empleado</button>
                </div>
                <div className="card" style={{ padding: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre y Apellidos</th>
                        <th>Rol Funcional</th>
                        <th>Teléfono</th>
                        <th>Coste / Hora</th>
                        <th>Cualificaciones / Carnets</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_EMPLOYEES.map((emp, idx) => (
                        <tr key={idx}>
                          <td><strong>{emp.nombre}</strong></td>
                          <td>{emp.rol}</td>
                          <td>{emp.contacto}</td>
                          <td>{emp.coste_hora.toFixed(2)} €</td>
                          <td>
                            {emp.carnets.map((c, i) => (
                              <span key={i} className="badge bg-info" style={{ marginRight: '5px' }}>{c}</span>
                            ))}
                          </td>
                          <td>
                            <span className={`badge ${emp.estado === 'Alta' ? 'bg-success' : 'bg-warning'}`}>
                              {emp.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. MAQUINARIA */}
            {activeTab === 'datos-maquinaria' && (
              <div className="grid-3">
                <div className="card">
                  <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--color-admin)' }}>John Deere 6155M</strong>
                    <span className="badge bg-success">Operativo</span>
                  </div>
                  <small style={{ color: '#7F8C8D', display: 'block', marginBottom: '12px' }}>Matrícula: E-4588-BFG</small>
                  <div style={{ background: '#EAEDED', height: '120px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Tractor size={48} style={{ color: '#95A5A6' }} />
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <div className="flex" style={{ justifyContent: 'space-between' }}>
                      <span>Horas de Uso:</span> <strong>4.520 h</strong>
                    </div>
                    <div style={{ marginTop: '10px' }}>Salud y Mantenimiento:</div>
                    <div className="bar-track" style={{ height: '8px', marginTop: '4px' }}>
                      <div className="bar-fill bg-barbecho" style={{ width: '85%' }}></div>
                    </div>
                    <small style={{ color: 'var(--color-agri)', marginTop: '4px', display: 'block' }}>Correcto | Próxima ITV: Dic 2026</small>
                  </div>
                </div>

                <div className="card">
                  <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--color-admin)' }}>New Holland T5</strong>
                    <span className="badge bg-danger">En Taller</span>
                  </div>
                  <small style={{ color: '#7F8C8D', display: 'block', marginBottom: '12px' }}>Matrícula: E-1122-BBB</small>
                  <div style={{ background: '#EAEDED', height: '120px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Tractor size={48} style={{ color: '#95A5A6' }} />
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <div className="flex" style={{ justifyContent: 'space-between' }}>
                      <span>Horas de Uso:</span> <strong>2.100 h</strong>
                    </div>
                    <div style={{ marginTop: '10px' }}>Fallo Detectado:</div>
                    <div className="bar-track" style={{ height: '8px', marginTop: '4px' }}>
                      <div className="bar-fill bg-danger" style={{ width: '20%' }}></div>
                    </div>
                    <small style={{ color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>Fuga Hidráulica - Revisión pendiente</small>
                  </div>
                </div>

                <div className="card">
                  <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--color-admin)' }}>Sembradora Aguirre</strong>
                    <span className="badge bg-success">Operativo</span>
                  </div>
                  <small style={{ color: '#7F8C8D', display: 'block', marginBottom: '12px' }}>ID Interno: AP-004</small>
                  <div style={{ background: '#EAEDED', height: '120px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    <Layers size={48} style={{ color: '#95A5A6' }} />
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <div>Ancho de Labor: <strong>6.0 metros</strong></div>
                    <div style={{ marginTop: '5px' }}>Último uso registrado: 15/11/2025</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. PARCELAS (SIGPAC) */}
            {activeTab === 'parcelas' && (
              <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="flex-col">
                  {/* Formulario */}
                  <div className="card" style={{ borderLeft: '4px solid var(--color-agri)' }}>
                    <div className="card-header" style={{ color: 'var(--color-agri)' }}>Dar de Alta Parcela en SIGPAC</div>
                    <form onSubmit={handleAddPlot} style={{ fontSize: '12px' }}>
                      <div className="grid-3">
                        <div className="form-group">
                          <label>Polígono</label>
                          <input 
                            type="number" 
                            value={newPlot.sigpac_poligono || ''} 
                            onChange={(e) => setNewPlot({...newPlot, sigpac_poligono: parseInt(e.target.value) || 0})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Recinto</label>
                          <input 
                            type="number" 
                            value={newPlot.sigpac_recinto || ''} 
                            onChange={(e) => setNewPlot({...newPlot, sigpac_recinto: parseInt(e.target.value) || 0})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Uso SIGPAC</label>
                          <input 
                            type="text" 
                            value={newPlot.sigpac_uso} 
                            onChange={(e) => setNewPlot({...newPlot, sigpac_uso: e.target.value})}
                            required 
                          />
                        </div>
                      </div>
                      <div className="grid-3" style={{ marginTop: '10px' }}>
                        <div className="form-group">
                          <label>Alias / Identificador</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Parcela Norte"
                            value={newPlot.alias} 
                            onChange={(e) => setNewPlot({...newPlot, alias: e.target.value})}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Superficie (ha)</label>
                          <input 
                            type="number" 
                            step="0.0001" 
                            value={newPlot.superficie_cultivada || ''} 
                            onChange={(e) => setNewPlot({...newPlot, superficie_cultivada: parseFloat(e.target.value) || 0})}
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label>Especie</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Trigo"
                            value={newPlot.especie} 
                            onChange={(e) => setNewPlot({...newPlot, especie: e.target.value})}
                            required 
                          />
                        </div>
                      </div>
                      <div className="grid-2" style={{ marginTop: '10px' }}>
                        <div className="form-group">
                          <label>Variedad</label>
                          <input 
                            type="text" 
                            value={newPlot.variedad} 
                            onChange={(e) => setNewPlot({...newPlot, variedad: e.target.value})} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Régimen de Cultivo</label>
                          <select 
                            value={newPlot.regimen} 
                            onChange={(e: any) => setNewPlot({...newPlot, regimen: e.target.value})}
                          >
                            <option value="secano">Secano</option>
                            <option value="regadio">Regadío</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-agri w-full" style={{ marginTop: '15px' }}>
                        Guardar Parcela
                      </button>
                    </form>
                  </div>

                  {/* Tabla */}
                  <div className="card" style={{ padding: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Ref. SIGPAC</th>
                          <th>Municipio</th>
                          <th>Uso</th>
                          <th>Alias</th>
                          <th>Superficie (ha)</th>
                          <th>Régimen</th>
                          <th>Especie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plots.map((p, idx) => (
                          <tr key={idx}>
                            <td>{`45:6:0:0:${p.sigpac_poligono}:${p.sigpac_recinto}`}</td>
                            <td>Alcaudete</td>
                            <td><span className="badge bg-info">{p.sigpac_uso}</span></td>
                            <td><strong>{p.alias}</strong></td>
                            <td>{p.superficie_cultivada.toFixed(2)} ha</td>
                            <td>{p.regimen}</td>
                            <td>{p.especie}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mapa Mock */}
                <div className="card" style={{ background: '#D5F5E3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '15px' }}>
                  <div className="card-header" style={{ color: 'var(--color-agri)', marginBottom: 0 }}>Mapa Catastral SIGPAC</div>
                  <div style={{ flex: 1, border: '2px dashed var(--color-agri)', borderRadius: '4px', margin: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAFAF1', color: 'var(--color-agri)', fontWeight: 'bold' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Map size={48} style={{ marginBottom: '10px' }} />
                      <div>Visor SIGPAC Activo</div>
                      <small style={{ fontWeight: 'normal', color: '#7F8C8D' }}>Polígono 11 Toledo</small>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#7F8C8D' }}>
                    Capas cargadas: Linderos catastrales, Zonas Vulnerables de Nitratos.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 6. TRATAMIENTOS FITOSANITARIOS */}
            {activeTab === 'tratamientos' && (
              <div className="flex-col" style={{ gap: '20px' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--color-agri)' }}>
                  <div className="card-header" style={{ color: 'var(--color-agri)' }}>Registrar Nuevo Tratamiento (Cuaderno Digital)</div>
                  <form onSubmit={handleAddFito}>
                    <div className="grid-4">
                      <div className="form-group">
                        <label>Fecha de Aplicación</label>
                        <input 
                          type="date" 
                          value={newFito.fecha_aplicacion}
                          onChange={(e) => setNewFito({...newFito, fecha_aplicacion: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Producto Comercial</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Roundup Ultra Plus"
                          value={newFito.producto}
                          onChange={(e) => setNewFito({...newFito, producto: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Nº Registro Oficial</label>
                        <input 
                          type="text" 
                          placeholder="Ej: ES-12345"
                          value={newFito.num_registro_oficial}
                          onChange={(e) => setNewFito({...newFito, num_registro_oficial: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Problema Fitosanitario</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Malas hierbas"
                          value={newFito.problema_fitosanitario}
                          onChange={(e) => setNewFito({...newFito, problema_fitosanitario: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid-3" style={{ marginTop: '10px' }}>
                      <div className="form-group">
                        <label>Dosis</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={newFito.dosis || ''}
                          onChange={(e) => setNewFito({...newFito, dosis: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Unidad de Medida</label>
                        <select 
                          value={newFito.unidad_medida}
                          onChange={(e) => setNewFito({...newFito, unidad_medida: e.target.value})}
                        >
                          <option value="L/ha">Litros / Hectárea (L/ha)</option>
                          <option value="kg/ha">Kilos / Hectárea (kg/ha)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Superficie Tratada (ha)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={newFito.superficie_tratada || ''}
                          onChange={(e) => setNewFito({...newFito, superficie_tratada: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ marginTop: '10px' }}>
                      <div className="form-group">
                        <label>Nombre del Aplicador (Carnet ROPO)</label>
                        <select 
                          value={newFito.aplicador_nombre}
                          onChange={(e) => setNewFito({...newFito, aplicador_nombre: e.target.value})}
                        >
                          <option value="Luis M. Rodríguez">Luis M. Rodríguez (Carnet: ROPO-99221)</option>
                          <option value="Antonio García">Antonio García (Carnet: ROPO-88112)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Eficacia Valorada</label>
                        <select 
                          value={newFito.eficacia}
                          onChange={(e) => setNewFito({...newFito, eficacia: e.target.value})}
                        >
                          <option value="Alta">Alta</option>
                          <option value="Buena">Buena</option>
                          <option value="Suficiente">Suficiente</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-agri w-full" style={{ marginTop: '15px' }}>
                      Registrar Tratamiento
                    </button>
                  </form>
                </div>

                <div className="card" style={{ padding: 0 }}>
                  <div className="card-header" style={{ padding: '15px', marginBottom: 0 }}>Historial de Tratamientos Registrados (Vigentes)</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Producto Comercial (Nº Reg)</th>
                        <th>Problema Tratado</th>
                        <th>Dosis</th>
                        <th>Superficie</th>
                        <th>Aplicador Habilitado</th>
                        <th>Estado CUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fitoTreatments.map((f, idx) => (
                        <tr key={idx}>
                          <td>{f.fecha_aplicacion}</td>
                          <td><strong>{f.producto}</strong> <small style={{ color: '#7F8C8D' }}>({f.num_registro_oficial})</small></td>
                          <td>{f.problema_fitosanitario}</td>
                          <td>{f.dosis} {f.unidad_medida}</td>
                          <td>{f.superficie_tratada} ha</td>
                          <td>{f.aplicador_nombre}</td>
                          <td><span className="badge bg-success">Validado</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DIAGNÓSTICO IA (VISUAL PEST DIAGNOSIS) */}
            {activeTab === 'diagnostico-ia' && (
              <div className="grid-2" style={{ gap: '20px' }}>
                <div className="flex-col" style={{ gap: '20px' }}>
                  <div className="card" style={{ borderLeft: '4px solid var(--color-agri)' }}>
                    <div className="card-header" style={{ color: 'var(--color-agri)' }}>Muestra de Hoja o Cultivo Afectado</div>
                    <p style={{ fontSize: '12px', color: '#7F8C8D', marginBottom: '15px' }}>
                      Selecciona una muestra prediseñada para probar el escáner del modelo de visión artificial, o sube una imagen de tus propias parcelas.
                    </p>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label>Tipo de Cultivo</label>
                      <select 
                        value={selectedCrop} 
                        onChange={(e) => {
                          setSelectedCrop(e.target.value);
                          setDiagnosed(false);
                          setDiagnosisResult(null);
                        }}
                      >
                        <option value="olivar">Olivar (Olivos)</option>
                        <option value="trigo">Trigo / Cereales de Invierno</option>
                        <option value="vinedo">Viñedo / Vid</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                      <label>Muestras de Demostración Rápida</label>
                      <div className="grid-2">
                        <button 
                          className="btn btn-outline" 
                          style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px' }}
                          onClick={() => {
                            setUploadedImage('./olive_leaf_disease.png');
                            setSelectedCrop('olivar');
                            setDiagnosed(false);
                            setDiagnosisResult(null);
                          }}
                        >
                          🍂 Hoja de Olivo Afectada
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px' }}
                          onClick={() => {
                            setUploadedImage('./wheat_leaf_rust.png');
                            setSelectedCrop('trigo');
                            setDiagnosed(false);
                            setDiagnosisResult(null);
                          }}
                        >
                          🌾 Hoja de Trigo con Roya
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Subir Imagen Personalizada</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ fontSize: '12px' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setUploadedImage(event.target?.result as string);
                              setDiagnosed(false);
                              setDiagnosisResult(null);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>

                    {uploadedImage ? (
                      <div style={{ marginTop: '15px' }}>
                        <div className={`scan-container ${diagnosing ? 'pulse-glow' : ''}`}>
                          <img src={uploadedImage} alt="Muestra foliar" className="scan-image" />
                          {diagnosing && <div className="scan-line"></div>}
                          <div className="scan-grid-overlay"></div>
                        </div>

                        {!diagnosing && !diagnosed && (
                          <button 
                            className="btn btn-agri w-full" 
                            style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={runPestDiagnosis}
                          >
                            <Sparkles size={16} /> Analizar Diagnóstico con Gemini IA
                          </button>
                        )}

                        {diagnosing && (
                          <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-agri)', marginBottom: '8px' }}>
                              {scanStatusText}
                            </div>
                            <div className="bar-track" style={{ height: '10px' }}>
                              <div className="bar-fill bg-barbeflow" style={{ width: `${scanProgress}%`, background: 'var(--color-agri)' }}></div>
                            </div>
                            <small style={{ color: '#7F8C8D', display: 'block', marginTop: '4px' }}>{scanProgress}% Completado</small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed var(--color-border)', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#7F8C8D', marginTop: '15px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <Brain size={36} style={{ color: '#BDC3C7', marginBottom: '8px' }} />
                          <div>Ninguna imagen seleccionada</div>
                          <small>Selecciona una muestra demo de arriba o sube tu archivo</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-col">
                  {diagnosed && diagnosisResult ? (
                    <div className="card" style={{ borderTop: `4px solid ${diagnosisResult.gravedadColor}` }}>
                      <div className="card-header" style={{ marginBottom: '10px' }}>
                        <span style={{ color: 'var(--color-admin)' }}>Diagnóstico Fitosanitario IA</span>
                        <span className="badge" style={{ background: diagnosisResult.gravedadColor }}>Gravedad: {diagnosisResult.gravedad}</span>
                      </div>
                      
                      <div style={{ background: '#F8F9F9', padding: '12px', borderRadius: '6px', border: '1px solid #ECF0F1', marginBottom: '15px' }}>
                        <div style={{ fontSize: '11px', color: '#7F8C8D' }}>PLAGA / ENFERMEDAD DETECTADA:</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-admin)' }}>
                          {diagnosisResult.plaga}
                        </div>
                        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#7F8C8D' }}>
                          Clasificación científica: {diagnosisResult.cientifico}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px', fontSize: '12px', color: 'var(--color-agri)', fontWeight: 'bold' }}>
                          <Sparkles size={14} /> Fiabilidad del diagnóstico: {diagnosisResult.confianza}
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <strong>Sintomatología:</strong>
                          <p style={{ color: '#5D6D7E', marginTop: '4px' }}>{diagnosisResult.sintomas}</p>
                        </div>

                        <hr style={{ border: 0, borderTop: '1px solid #ECF0F1' }} />

                        <div>
                          <strong>Tratamiento Químico Recomendado (MAPA):</strong>
                          <p style={{ color: 'var(--color-danger)', fontWeight: 'bold', marginTop: '4px' }}>
                            {diagnosisResult.tratamientoQuimico}
                          </p>
                          <small style={{ color: '#7F8C8D', display: 'block', marginTop: '2px' }}>
                            Cumple el Real Decreto de Uso Sostenible de Fitosanitarios. Registrar en el CUE en un mes.
                          </small>
                        </div>

                        <hr style={{ border: 0, borderTop: '1px solid #ECF0F1' }} />

                        <div>
                          <strong>Tratamiento Biológico Alternativo:</strong>
                          <p style={{ color: 'var(--color-agri)', fontWeight: 'bold', marginTop: '4px' }}>
                            {diagnosisResult.tratamientoBiologico}
                          </p>
                        </div>

                        <hr style={{ border: 0, borderTop: '1px solid #ECF0F1' }} />

                        <div>
                          <strong>Medidas Culturales Preventivas:</strong>
                          <p style={{ color: '#5D6D7E', marginTop: '4px' }}>{diagnosisResult.preventivo}</p>
                        </div>
                      </div>

                      <button 
                        className="btn btn-outline w-full"
                        style={{ marginTop: '20px', border: '1px solid var(--color-agri)', color: 'var(--color-agri)' }}
                        onClick={() => {
                          // Prefillear el formulario de tratamientos fitosanitarios
                          const prodParts = diagnosisResult.tratamientoQuimico.split(' (');
                          const prodName = prodParts[0] || '';
                          const regNum = prodParts[1] ? prodParts[1].replace('Nº Reg: ', '').replace(')', '').split(' - ')[0] : 'ES-12001';
                          
                          setNewFito({
                            fecha_aplicacion: new Date().toISOString().split('T')[0],
                            producto: prodName.toUpperCase(),
                            num_registro_oficial: regNum,
                            dosis: selectedCrop === 'olivar' ? 0.4 : 1.0,
                            unidad_medida: selectedCrop === 'olivar' ? 'L/ha' : 'kg/ha',
                            superficie_tratada: 8.5,
                            aplicador_nombre: 'Luis M. Rodríguez',
                            eficacia: 'Pendiente',
                            problema_fitosanitario: diagnosisResult.plaga
                          });
                          
                          setActiveTab('tratamientos');
                          alert('Datos del tratamiento fitosanitario cargados en el formulario. ¡Comprueba las dosis y regístralo!');
                        }}
                      >
                        📥 Volcar a Formulario de Tratamientos CUE
                      </button>
                    </div>
                  ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', borderStyle: 'dashed', borderColor: '#BDC3C7' }}>
                      <div style={{ textAlign: 'center', padding: '40px', color: '#7F8C8D' }}>
                        <Brain size={48} style={{ color: '#BDC3C7', marginBottom: '15px' }} />
                        <h3>Resultados del Diagnóstico IA</h3>
                        <p style={{ fontSize: '12px', marginTop: '10px', maxWidth: '300px', margin: '10px auto' }}>
                          Carga una muestra de cultivo y pulsa "Analizar" para extraer las patologías, nivel de gravedad y tratamientos ecológicos u oficiales de las guías de fitosanitarios del MAPA.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 7. FERTILIZACIÓN */}
            {activeTab === 'fertilizacion' && (
              <div className="flex-col" style={{ gap: '20px' }}>
                <div className="card">
                  <div className="card-header">Plan de Abonado y Nutrición 2025/2026</div>
                  <p style={{ fontSize: '12px', color: '#7F8C8D', marginBottom: '20px' }}>
                    Control de Unidades Fertilizantes (UF) recomendadas para evitar saturación de nitratos en suelo.
                  </p>
                  <div className="grid-3">
                    <div style={{ background: '#EAF2F8', padding: '15px', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '11px', color: '#2471A3', display: 'block' }}>Nitrógeno (N) Recomendado</strong>
                      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>120 UF / ha</span>
                      <small style={{ display: 'block', color: '#7F8C8D', marginTop: '4px' }}>Límite zona vulnerable: 170 UF</small>
                    </div>
                    <div style={{ background: '#EAF2F8', padding: '15px', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '11px', color: '#2471A3', display: 'block' }}>Fósforo (P2O5) Recomendado</strong>
                      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>40 UF / ha</span>
                    </div>
                    <div style={{ background: '#EAF2F8', padding: '15px', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '11px', color: '#2471A3', display: 'block' }}>Potasio (K2O) Recomendado</strong>
                      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>60 UF / ha</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 0 }}>
                  <div className="card-header" style={{ padding: '15px', marginBottom: 0 }}>Registro de Enmiendas y Abonados</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo de Abono</th>
                        <th>Producto comercial</th>
                        <th>Composición (N-P-K)</th>
                        <th>Dosis / Cantidad</th>
                        <th>Parcela Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>01/02/2026</td>
                        <td>Químico / Mineral</td>
                        <td>DAP (Fosfato Diamónico)</td>
                        <td>18-46-0</td>
                        <td>150 kg/ha (Fondo)</td>
                        <td>Parcela Los Olivos (Secano)</td>
                      </tr>
                      <tr>
                        <td>15/09/2025</td>
                        <td>Orgánico / Estiércol</td>
                        <td>Estiércol Vacuno Semisólido</td>
                        <td>3-2-2</td>
                        <td>10.000 kg/ha</td>
                        <td>P-11-41 (Barbecho)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 8. INFORME AGRICOLA / CUADERNO DIGITAL */}
            {activeTab === 'informes-agri' && (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <FileText size={64} style={{ color: 'var(--color-agri)', marginBottom: '20px' }} />
                <h3>Generar Cuaderno Digital de Explotación (CUE)</h3>
                <p style={{ maxWidth: '600px', margin: '15px auto', color: '#7F8C8D', lineHeight: '1.6' }}>
                  Este asistente consolida la información catastral, el registro de siembras, fertilización y tratamientos fitosanitarios obligatorios. Genera el fichero estructurado XML para su transmisión directa al SIEX.
                </p>
                
                <div className="flex" style={{ justifyContent: 'center', gap: '20px', margin: '30px 0' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label>Fecha de Inicio</label>
                    <input type="date" defaultValue="2025-09-01" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label>Fecha de Cierre</label>
                    <input type="date" defaultValue="2026-08-31" />
                  </div>
                </div>

                <div className="flex" style={{ justifyContent: 'center', gap: '15px' }}>
                  <button className="btn btn-agri" onClick={() => alert('Generando archivo XML oficial de interconexión con SIEX...')}>
                    Descargar XML (SIEX)
                  </button>
                  <button className="btn btn-outline" onClick={() => alert('Generando informe en PDF para impresión o inspección...')}>
                    Descargar PDF Oficial
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 9. CENSO GANADERO */}
            {activeTab === 'censo' && (
              <div className="flex-col" style={{ gap: '20px' }}>
                <div className="grid-3">
                  <div style={{ background: 'white', padding: '15px 20px', borderRadius: '8px', border: '1px solid #E5E7E9', boxShadow: 'var(--shadow)' }}>
                    <small style={{ color: '#7F8C8D', fontWeight: 'bold' }}>TOTAL CABEZAS</small>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--color-gana)' }}>{animals.length}</div>
                    <small style={{ color: '#27AE60' }}>● {animals.filter(a => a.activo).length} Activos</small>
                  </div>
                  <div style={{ background: 'white', padding: '15px 20px', borderRadius: '8px', border: '1px solid #E5E7E9', boxShadow: 'var(--shadow)' }}>
                    <small style={{ color: '#7F8C8D', fontWeight: 'bold' }}>HEMBRAS REPRODUCTORAS</small>
                    <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{animals.filter(a => a.sexo === 'H').length}</div>
                  </div>
                  <div style={{ background: 'white', padding: '15px 20px', borderRadius: '8px', border: '1px solid #E5E7E9', boxShadow: 'var(--shadow)' }}>
                    <small style={{ color: '#7F8C8D', fontWeight: 'bold' }}>TERNEROS RECRÍA</small>
                    <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{animals.filter(a => a.clasificacion === 'Lactante').length}</div>
                  </div>
                </div>

                <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                  {/* Registro */}
                  <div className="card" style={{ borderLeft: '4px solid var(--color-gana)' }}>
                    <div className="card-header" style={{ color: 'var(--color-gana)' }}>Registrar Animal Individual</div>
                    <form onSubmit={handleAddAnimal} style={{ fontSize: '11px' }}>
                      <div className="form-group">
                        <label>Crotal Oficial (ID Único)</label>
                        <input 
                          type="text" 
                          placeholder="Ej: ES000002874563"
                          value={newAnimal.crotal}
                          onChange={(e) => setNewAnimal({...newAnimal, crotal: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '5px' }}>
                        <label>Número DIB</label>
                        <input 
                          type="text" 
                          placeholder="Ej: DIB-4563"
                          value={newAnimal.dib}
                          onChange={(e) => setNewAnimal({...newAnimal, dib: e.target.value})}
                        />
                      </div>
                      <div className="form-group" style={{ marginTop: '5px' }}>
                        <label>Raza</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Limusín"
                          value={newAnimal.raza}
                          onChange={(e) => setNewAnimal({...newAnimal, raza: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid-2" style={{ marginTop: '5px' }}>
                        <div className="form-group">
                          <label>Sexo</label>
                          <select 
                            value={newAnimal.sexo}
                            onChange={(e: any) => setNewAnimal({...newAnimal, sexo: e.target.value})}
                          >
                            <option value="H">Hembra (H)</option>
                            <option value="M">Macho (M)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Fecha de Nacimiento</label>
                          <input 
                            type="date" 
                            value={newAnimal.fecha_nacimiento}
                            onChange={(e) => setNewAnimal({...newAnimal, fecha_nacimiento: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: '5px' }}>
                        <label>Estado / Clasificación</label>
                        <select 
                          value={newAnimal.clasificacion}
                          onChange={(e) => setNewAnimal({...newAnimal, clasificacion: e.target.value})}
                        >
                          <option value="Vacía">Vacía / Aptitud Carne</option>
                          <option value="Preñada">Preñada</option>
                          <option value="Lactante">Lactante</option>
                          <option value="Semental">Toro Semental</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-gana w-full" style={{ marginTop: '12px' }}>
                        Registrar Animal
                      </button>
                    </form>
                  </div>

                  {/* Tabla */}
                  <div className="card" style={{ padding: 0 }}>
                    <div className="card-header" style={{ padding: '15px', marginBottom: 0 }}>Censo Vivo Registrado</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Crotal Oficial</th>
                          <th>DIB</th>
                          <th>Raza</th>
                          <th>Sexo</th>
                          <th>Nacido</th>
                          <th>Clasificación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {animals.map((an, idx) => (
                          <tr key={idx}>
                            <td><strong>{an.crotal}</strong></td>
                            <td>{an.dib || '-'}</td>
                            <td>{an.raza}</td>
                            <td>{an.sexo}</td>
                            <td>{an.fecha_nacimiento}</td>
                            <td>
                              <span className={`badge ${an.clasificacion === 'Preñada' ? 'bg-success' : an.clasificacion === 'Lactante' ? 'bg-info' : 'bg-warning'}`}>
                                {an.clasificacion}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 10. IDENTIFICACIÓN Y CROTALES */}
            {activeTab === 'identificacion' && (
              <div className="grid-2" style={{ gap: '20px' }}>
                <div className="card">
                  <div className="card-header">Stock de Crotales Físicos Autorizados</div>
                  <p style={{ fontSize: '12px', color: '#7F8C8D', marginBottom: '20px' }}>
                    Rango de identificadores crotales adjudicados por la Oficina Comarcal Agraria (OCA) para nacimientos de la campaña.
                  </p>
                  <div style={{ background: '#FFF9E6', border: '1px solid #F39C12', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                    <strong>Lote Campaña 2026 - Rango A</strong>
                    <div style={{ fontFamily: 'monospace', fontSize: '15px', marginTop: '6px', fontWeight: 'bold' }}>
                      ES000002880001 <span style={{ color: '#7F8C8D' }}>a</span> ES000002880050
                    </div>
                    <div style={{ fontSize: '11px', color: '#7F8C8D', marginTop: '10px' }}>
                      Crotales libres restantes: <strong>42 unidades</strong>
                    </div>
                  </div>
                  <button className="btn btn-gana" onClick={() => alert('Petición de crotales enviada a la delegación REGA de la CCAA.')}>
                    + Solicitar Nuevo Lote Oficial
                  </button>
                </div>

                <div className="card">
                  <div className="card-header">Asignación Rápida de Identificación</div>
                  <p style={{ fontSize: '12px', color: '#7F8C8D', marginBottom: '15px' }}>
                    Asigne el siguiente identificador de crotal del stock al nacimiento de un ternero.
                  </p>
                  <div style={{ background: '#EAEDED', padding: '15px', borderRadius: '4px', textAlign: 'center', marginBottom: '20px' }}>
                    <small style={{ color: '#7F8C8D', display: 'block' }}>Crotal Propuesto (Autoincrementado)</small>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-gana)', fontFamily: 'monospace' }}>
                      ES000002880009
                    </span>
                  </div>
                  <button className="btn btn-primary w-full" onClick={() => setActiveTab('censo')}>
                    Ir a Ficha de Registro de Nacimiento
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 11. MOVIMIENTOS VIVOS (LIBRO REGISTRO) */}
            {activeTab === 'actividad-gana' && (
              <div className="flex-col" style={{ gap: '20px' }}>
                <div className="card">
                  <div className="card-header">Libro de Registro Oficial de Movimientos Ganaderos (REGA)</div>
                  <div className="flex" style={{ gap: '15px' }}>
                    <button className="btn btn-gana" onClick={() => alert('Registrar Entrada o Salida con guía...')}>
                      Nuevo Movimiento (Compra/Venta)
                    </button>
                    <button className="btn btn-outline" onClick={() => alert('Generando libro REGA oficial en PDF...')}>
                      Imprimir Libro REGA PDF
                    </button>
                  </div>
                </div>

                <div className="card" style={{ padding: 0 }}>
                  <div className="card-header" style={{ padding: '15px', marginBottom: 0 }}>Movimientos de la Explotación (Últimos 12 meses)</div>
                  <ul className="timeline" style={{ padding: '20px' }}>
                    <li className="timeline-item">
                      <div className="flex" style={{ justifyContent: 'space-between' }}>
                        <span className="badge bg-danger">SALIDA / TRASLADO</span>
                        <small>15/01/2026</small>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '12px', background: '#F8F9F9', padding: '12px', border: '1px solid #ECF0F1', borderRadius: '4px' }}>
                        <strong>Destinatario:</strong> CEBADERO DE VACUNO LOS VALLES (REGA: ES4508821)<br />
                        <strong>Detalle:</strong> Traslado de 15 Terneros cruzados de carne (Guía nº: G-2026-003)<br />
                        <strong>Transportista:</strong> Transportes Agropecuarios SL
                      </div>
                    </li>
                    <li className="timeline-item">
                      <div className="flex" style={{ justifyContent: 'space-between' }}>
                        <span className="badge bg-success">ENTRADA / COMPRA</span>
                        <small>02/01/2026</small>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '12px', background: '#F8F9F9', padding: '12px', border: '1px solid #ECF0F1', borderRadius: '4px' }}>
                        <strong>Origen:</strong> SUBASTA GANADERA CÁCERES<br />
                        <strong>Detalle:</strong> Entrada de 1 Semental Limusín Puro (Guía nº: G-2026-001)
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 12. SENSORES IOT */}
            {activeTab === 'iot' && (() => {
              // Resolver localización según la explotación seleccionada
              const isGana = mode === 'ganaderia';
              const locKey = isGana ? 'caceres' : 'toledo';
              const activeLoc = weatherData ? weatherData[locKey] : null;
              const forecastDays = activeLoc?.prediccion?.dia || [];
              const todayForecast = forecastDays[0] || null;
              
              // Extraer variables para UI
              const maxTemp = todayForecast?.temperatura?.maxima ?? 36;
              const minTemp = todayForecast?.temperatura?.minima ?? 20;
              const mainProbRain = todayForecast?.probPrecipitacion?.[0]?.value ?? 0;
              const windSpeed = todayForecast?.viento?.[0]?.velocidad ?? 12;
              const windDir = todayForecast?.viento?.[0]?.direccion ?? 'SO';
              const humMax = todayForecast?.humedadRelativa?.maxima ?? 40;
              const humMin = todayForecast?.humedadRelativa?.minima ?? 15;

              // Lógica de Recomendación de Riego Inteligente
              let recommendationText = '';
              let recommendationBadge = '';
              let recommendationColor = '';
              
              if (mainProbRain >= 30) {
                recommendationText = `AHORRO DE AGUA ACTIVADO: Alta probabilidad de precipitación (${mainProbRain}%). Se suspende el ciclo automático de riego. Ahorro de caudal estimado: 150 m³ por sector.`;
                recommendationBadge = 'Riego Suspendido (Lluvia)';
                recommendationColor = '#27AE60';
              } else if (windSpeed > 20) {
                recommendationText = `ALERTA DE SEGURIDAD POR VIENTO: Ráfagas de viento detectadas de ${windSpeed} km/h (${windDir}). El riego por aspersión queda desaconsejado debido a pérdidas por deriva y falta de uniformidad.`;
                recommendationBadge = 'Alerta Viento (Evitar Aspersión)';
                recommendationColor = '#E67E22';
              } else if (maxTemp >= 35) {
                recommendationText = `RIEGO DE SOPORTE NECESARIO: Temperaturas extremadamente altas (${maxTemp}°C) con humedad mínima del ${humMin}%. Se recomienda un aporte extra de agua en horas de menor insolación (06:00 a 08:00).`;
                recommendationBadge = 'Riego Extra Recomendado';
                recommendationColor = 'var(--color-danger)';
              } else {
                recommendationText = `ESTADO ÓPTIMO: Condiciones meteorológicas equilibradas (Temp: ${maxTemp}°C, Viento: ${windSpeed} km/h). Mantener ciclo de riego programado según sensores locales.`;
                recommendationBadge = 'Ciclo Normal Programado';
                recommendationColor = 'var(--color-agri)';
              }

              return (
                <div className="flex-col" style={{ gap: '20px' }}>
                  {/* Fila de Encabezado de AEMET */}
                  <div className="card" style={{ borderLeft: '4px solid var(--color-agri)', background: '#F8F9F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CloudSun style={{ color: 'var(--color-agri)' }} size={22} />
                          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-admin)' }}>
                            Estación Meteorológica Virtual (Sincronizada AEMET)
                          </h3>
                        </div>
                        <p style={{ fontSize: '12px', color: '#7F8C8D', marginTop: '4px', margin: 0 }}>
                          Municipio monitorizado: <strong>{activeLoc ? `${activeLoc.nombre} (${activeLoc.provincia})` : 'Cargando datos...'}</strong>
                        </p>
                      </div>
                      <span className="badge bg-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● Sincronizado hace 15m
                      </span>
                    </div>
                  </div>

                  {/* Tarjetas de Sensores Locales enlazados a Clima */}
                  <div className="grid-3">
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="sensor-icon-wrapper" style={{ background: '#E8F8F5', color: '#117A65', padding: '12px', borderRadius: '50%' }}>
                        <Droplets size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7F8C8D' }}>HUMEDAD RELATIVA (SUELO / AIRE)</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>42% / {humMin}-{humMax}%</div>
                        <small style={{ color: '#27AE60', fontWeight: 'bold' }}>Sonda de Humedad OK</small>
                      </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="sensor-icon-wrapper" style={{ background: '#FDEDEC', color: '#CB4335', padding: '12px', borderRadius: '50%' }}>
                        <Thermometer size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7F8C8D' }}>TEMPERATURA DIARIA</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{minTemp}°C a {maxTemp}°C</div>
                        <small style={{ color: maxTemp >= 35 ? 'var(--color-danger)' : '#7F8C8D', fontWeight: 'bold' }}>
                          {maxTemp >= 35 ? '⚠ Calor Extremo' : 'Estado Estable'}
                        </small>
                      </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="sensor-icon-wrapper" style={{ background: '#EAF2F8', color: '#2980B9', padding: '12px', borderRadius: '50%' }}>
                        <Wind size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#7F8C8D' }}>VELOCIDAD & DIRECCIÓN VIENTO</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{windSpeed} km/h ({windDir})</div>
                        <small style={{ color: windSpeed > 20 ? '#E67E22' : '#7F8C8D', fontWeight: 'bold' }}>
                          {windSpeed > 20 ? '⚠ Deriva de Riego Alta' : 'Viento Moderado'}
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Panel de Recomendaciones de Riego Inteligente */}
                  <div className="card" style={{ borderTop: `4px solid ${recommendationColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: 'var(--color-admin)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} style={{ color: recommendationColor }} /> Recomendación de Riego del Asesor IA
                      </h4>
                      <span className="badge" style={{ background: recommendationColor, color: '#white' }}>
                        {recommendationBadge}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#2C3E50', margin: 0 }}>
                      {recommendationText}
                    </p>
                    <div style={{ marginTop: '15px', background: '#F2F4F4', padding: '10px', borderRadius: '4px', fontSize: '11px', color: '#5D6D7E' }}>
                      <strong>Criterio de Cálculo:</strong> Enlazado a la predicción oficial de AEMET para la parcela actual y cruzado con los sensores de humedad del suelo de la red IoT.
                    </div>
                  </div>

                  {/* Tabla de Predicción Semanal AEMET */}
                  <div className="card" style={{ padding: 0 }}>
                    <div className="card-header" style={{ padding: '15px', marginBottom: 0 }}>Previsión Meteorológica AEMET (Próximas Jornadas)</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha Predicción</th>
                          <th>Cielo</th>
                          <th>Temperatura</th>
                          <th>Prob. Lluvia</th>
                          <th>Dirección & Vel. Viento</th>
                          <th>Humedad Relativa</th>
                          <th>Sugerencia de Riego</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecastDays.map((day: any, idx: number) => {
                          const dateObj = new Date(day.fecha);
                          const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                          const wind = day.viento?.[0] || { velocidad: 0, direccion: 'N' };
                          const probRain = day.probPrecipitacion?.[0]?.value ?? 0;
                          
                          let actionBadge = '';
                          let actionColor = '';
                          if (probRain >= 30) {
                            actionBadge = 'Apagar Riego';
                            actionColor = 'badge bg-success';
                          } else if (wind.velocidad > 20) {
                            actionBadge = 'Posponer Riego';
                            actionColor = 'badge bg-warning';
                          } else {
                            actionBadge = 'Riego Normal';
                            actionColor = 'badge bg-info';
                          }

                          return (
                            <tr key={idx}>
                              <td><strong>{dateStr}</strong></td>
                              <td>{day.estadoCielo?.[0]?.descripcion ?? 'Despejado'}</td>
                              <td>{day.temperatura?.minima}°C a {day.temperatura?.maxima}°C</td>
                              <td>
                                <span className={probRain > 0 ? 'badge bg-warning' : ''}>
                                  {probRain}%
                                </span>
                              </td>
                              <td>{wind.direccion} a {wind.velocidad} km/h</td>
                              <td>{day.humedadRelativa?.minima}% - {day.humedadRelativa?.maxima}%</td>
                              <td>
                                <span className={actionColor}>{actionBadge}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Distribución y logs */}
                  <div className="grid-2">
                    <div>
                      <h5 style={{ fontSize: '13px', marginBottom: '10px' }}>Ubicación Satelital de Dispositivos</h5>
                      <div style={{ background: '#EAEDED', height: '220px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7F8C8D', border: '1px dashed #BDC3C7' }}>
                        <div style={{ textAlign: 'center' }}>
                          <Map size={36} style={{ marginBottom: '8px' }} />
                          <div>Mapa Satelital Cargado</div>
                          <small>Visualización de 3 sondas activas en la explotación</small>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '13px', marginBottom: '10px' }}>Historial del Servidor de Riego Autónomo</h5>
                      <ul style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--color-text)' }}>
                        <li style={{ color: mainProbRain >= 30 ? 'var(--color-danger)' : '#27AE60' }}>
                          {mainProbRain >= 30 ? '⚠ Ciclo suspendido preventivamente por predicción de lluvia.' : '✔ Riego automático activado por 15 minutos en Parcela Principal.'}
                        </li>
                        <li style={{ color: windSpeed > 20 ? '#E67E22' : 'inherit' }}>
                          {windSpeed > 20 ? '⚠ Sensores recomiendan posponer pulverizaciones foliares por viento fuerte.' : 'ℹ Velocidad del viento dentro de límites operativos.'}
                        </li>
                        <li>ℹ Telemetría Sincronizada con base de datos central Supabase.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* Footer */}
      <footer style={{ background: 'white', padding: '15px 30px', borderTop: '1px solid #ECF0F1', fontSize: '12px', color: '#7F8C8D', textAlign: 'center', marginTop: 'auto' }}>
        AgroApp &copy; {new Date().getFullYear()} - Sistema de Gestión Agropecuaria de Alta Precisión. Todos los derechos reservados.
      </footer>

      {/* --- CHATBOT FLOTANTE SIEX --- */}
      {view !== 'login' && (
        <>
          {/* Botón flotante burbuja */}
          {!chatOpen && (
            <div 
              className="siex-chat-button"
              onClick={() => setChatOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Bot size={20} />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Consultor SIEX IA</span>
              <span className="badge-pulse"></span>
            </div>
          )}

          {/* Ventana del Chat */}
          {chatOpen && (
            <div className="siex-chat-window">
              {/* Header */}
              <div className="siex-chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={18} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Asesor SIEX & PAC 2026</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', background: '#2ECC71', borderRadius: '50%', display: 'inline-block' }}></span>
                      Consultor Oficial de Explotación
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contenedor de Mensajes */}
              <div className="siex-chat-body">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`siex-msg ${msg.role === 'bot' ? 'bot' : 'user'}`}>
                    {/* Renderización simple de negrita básica y saltos de línea */}
                    {msg.content.split('\n').map((line, lIdx) => {
                      // Reemplazar **texto** con <strong>texto</strong>
                      const parts = line.split('**');
                      const renderedLine = parts.map((part, pIdx) => {
                        return pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part;
                      });
                      return (
                        <p key={lIdx} style={{ margin: '0 0 6px 0' }}>
                          {renderedLine}
                        </p>
                      );
                    })}
                  </div>
                ))}
                
                {isChatTyping && (
                  <div className="siex-msg bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '10px 14px' }}>
                    <span className="badge-pulse" style={{ background: '#7F8C8D', position: 'static', transform: 'none' }}></span>
                    <span style={{ color: '#7F8C8D', fontSize: '11px', fontStyle: 'italic' }}>Asesor AgroApp está redactando...</span>
                  </div>
                )}
              </div>

              {/* Atajos Rápidos */}
              <div style={{ padding: '8px 12px', background: '#F8F9F9', borderTop: '1px solid #ECF0F1', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px' }}
                  onClick={() => handleSendMessage('¿Cuáles son las obligaciones del SIEX 2026?')}
                >
                  📋 Obligaciones SIEX
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px' }}
                  onClick={() => handleSendMessage('¿Cuál es el límite de nitratos permitido?')}
                >
                  💧 Límite Nitratos
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px' }}
                  onClick={() => handleSendMessage('¿Cuál es el plazo para registrar tratamientos en el CUE?')}
                >
                  ⏱ Plazos CUE
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '12px' }}
                  onClick={() => handleSendMessage('¿Cómo se registran nacimientos REGA?')}
                >
                  🐄 Registro REGA
                </button>
              </div>

              {/* Input Area */}
              <div className="siex-chat-footer">
                <input 
                  type="text" 
                  placeholder="Escribe tu consulta legal o de PAC..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(chatInput);
                    }
                  }}
                />
                <button 
                  className="btn btn-agri" 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => handleSendMessage(chatInput)}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
