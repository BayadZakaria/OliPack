
import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  History, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  Droplets, 
  Activity, 
  RefreshCw, 
  Loader2,
  PackageCheck,
  X,
  Barcode as BarcodeIcon,
  AlertTriangle,
  Beaker
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { db, MAASSRAS_DATA } from '../services/db';
import { UserProfile } from '../types';

interface ScanHistoryItem {
  id: string;
  site: string;
  volume: number;
  ph: number;
  temp: number;
  date: string;
  lotId: string;
}

interface ScanProps {
  user: UserProfile | null;
}

const BarcodeVisual: React.FC<{ value: string }> = ({ value }) => {
  const bars = value.split('').map((char, i) => {
    const width = (char.charCodeAt(0) % 3) + 1;
    const opacity = (char.charCodeAt(0) % 2 === 0) ? 'bg-slate-900' : 'bg-slate-300';
    return <div key={i} className={`h-6 ${opacity}`} style={{ width: `${width}px` }} />;
  });

  return (
    <div className="flex items-center gap-[1px] bg-white p-1 rounded-sm border border-slate-100 overflow-hidden">
      {bars}
      {bars}
    </div>
  );
};

const Scan: React.FC<ScanProps> = ({ user }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('olipack_scan_history');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveToHistory = (data: any) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      site: data.name || data.site || 'Site Inconnu',
      volume: data.vol || data.volume || 0,
      ph: data.ph || 0,
      temp: data.temp || 0,
      date: new Date().toLocaleString('fr-FR'),
      lotId: data.lotId || `LOT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
    const updated = [newItem, ...history].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('olipack_scan_history', JSON.stringify(updated));
  };

  const startScanner = async () => {
    setError(null);
    setScanning(true);
    setScanResult(null);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        html5QrCodeRef.current = scanner;
        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await scanner.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {}
        );
      } catch (err) {
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        setScanning(false);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.error("Erreur scanner", e);
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data && (data.type === 'OLIPACK_TRANSFER' || data.site)) {
        setScanResult(data);
        setError(null);
        await stopScanner();
      } else {
        setError("QR Code non valide.");
      }
    } catch (e) {
      setError("Format invalide.");
    }
  };

  const handleFinalValidation = async () => {
    if (!scanResult) return;
    setValidating(true);
    try {
      await db.saveCollectionEvent({
        site: scanResult.name || scanResult.site,
        volume: scanResult.vol || scanResult.volume,
        type: 'RÉCEPTION_SCAN',
        ph: scanResult.ph,
        temp: scanResult.temp,
        lotId: scanResult.lotId
      });
      saveToHistory(scanResult);
      setScanResult(null);
      setValidating(false);
    } catch (e) {
      setError("Erreur synchronisation.");
      setValidating(false);
    }
  };

  const simulateScan = () => {
    // Si technicien, on utilise sa ville, sinon une ville aléatoire
    const city = user?.ville || "Beni Mellal";
    const maassrasInCity = MAASSRAS_DATA[city] || ["Maâssra Principale"];
    const randomMaassra = maassrasInCity[Math.floor(Math.random() * maassrasInCity.length)];

    const mockData = {
      type: 'OLIPACK_TRANSFER',
      id: 'SIM-' + Math.floor(Math.random() * 1000),
      name: randomMaassra,
      vol: Math.floor(Math.random() * 4000) + 500,
      ph: parseFloat((4 + Math.random()).toFixed(2)),
      temp: parseFloat((20 + Math.random() * 10).toFixed(1)),
      lotId: `LOT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
    handleScanSuccess(JSON.stringify(mockData));
  };

  const clearHistory = () => {
    if (confirm("Vider l'historique ?")) {
      setHistory([]);
      localStorage.removeItem('olipack_scan_history');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
             <div className="bg-emerald-950 p-2.5 rounded-2xl shadow-lg">
                <QrCode className="text-white w-7 h-7" />
             </div>
             Réception & Scan
          </h1>
          <p className="text-slate-500 font-medium ml-1 mt-1 uppercase text-[10px] tracking-widest font-black tracking-[0.2em]">OliPack Logistics Gateway</p>
        </div>
        <button 
          onClick={simulateScan}
          className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 hover:bg-emerald-200 transition-all flex items-center gap-2"
        >
          <Beaker className="w-3 h-3" /> Simuler un Scan ({user?.ville || "Test"})
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          {!scanning && !scanResult ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 space-y-8 flex flex-col items-center shadow-sm">
              <div className="bg-slate-50 p-10 rounded-full border border-slate-100">
                <QrCode className="w-20 h-20 text-slate-200" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Scanner un Pass</h2>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed uppercase">Scannez le QR Code de transfert pour enregistrer l'entrée de lot.</p>
              </div>
              <button onClick={startScanner} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-emerald-600 transition-all active:scale-95">
                <Camera className="w-5 h-5" /> Démarrer le Scanner
              </button>
            </div>
          ) : scanResult ? (
            <div className="bg-white rounded-[3rem] p-10 border border-emerald-100 shadow-2xl space-y-8 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
                    <PackageCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Lot Détecté</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass ID: {scanResult.id || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => setScanResult(null)} className="p-2 bg-slate-50 text-slate-300 hover:text-red-500 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ScanInfo label="Site d'origine" value={scanResult.name || scanResult.site} icon={Truck} />
                <ScanInfo label="Volume Estimé" value={`${scanResult.vol || scanResult.volume} L`} icon={Droplets} />
                <ScanInfo label="pH Mesuré" value={scanResult.ph || 'N/A'} icon={Activity} />
                <ScanInfo label="Température" value={`${scanResult.temp || 'N/A'}°C`} icon={RefreshCw} />
              </div>

              <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-50">
                 <div className="flex flex-col items-center gap-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Code Barres du Lot</p>
                    <BarcodeVisual value={scanResult.lotId || 'LOT-TEMP'} />
                    <span className="text-[8px] font-mono text-slate-400">{scanResult.lotId || 'EN ATTENTE'}</span>
                 </div>
                 
                 <button 
                  onClick={handleFinalValidation}
                  disabled={validating}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {validating ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {validating ? 'SYNCHRONISATION...' : 'ENREGISTRER DANS LE CLOUD'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[3rem] p-10 border-4 border-slate-800 flex flex-col items-center justify-center relative shadow-2xl min-h-[450px]">
              <div id="reader" className="w-full max-w-xs rounded-2xl overflow-hidden border-4 border-slate-700 bg-black"></div>
              <button onClick={stopScanner} className="mt-8 px-8 py-3 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-600/20">
                Fermer la caméra
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <History className="w-4 h-4 text-slate-400" /> Historique Récent
                </h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter">Vider</button>
                )}
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                           <BarcodeVisual value={item.lotId} />
                           <span className="text-[7px] font-mono text-slate-400 font-bold">{item.lotId}</span>
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1 truncate">{item.site}</h4>
                           <p className="text-[8px] text-slate-400 font-bold uppercase">{item.date}</p>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-emerald-600">{item.volume} L</p>
                        <div className="flex items-center gap-1 justify-end">
                           <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Validé</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScanInfo: React.FC<{ label: string, value: string, icon: any }> = ({ label, value, icon: Icon }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
    <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm shrink-0"><Icon className="w-4 h-4" /></div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-[11px] font-black text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

export default Scan;
