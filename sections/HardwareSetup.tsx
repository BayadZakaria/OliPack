
import React, { useState } from 'react';
import { Cpu, Terminal, Zap, CheckCircle, Copy, Link as LinkIcon, Info, ExternalLink, Monitor } from 'lucide-react';

const HardwareSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const getArduinoCode = () => {
    return [
      '#include <WiFi.h>',
      '#include <HTTPClient.h>',
      '',
      'const char* ssid = "Wokwi-GUEST";',
      'const char* password = "";',
      'const char* api_url = "https://data.mongodb-api.com/app/data-api-v1/action/insertOne";',
      'const char* api_key = "VOTRE_CLE_API_MONGODB";',
      '',
      'void setup() {',
      '  Serial.begin(115200);',
      '  WiFi.begin(ssid, password);',
      '  while(WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }',
      '  Serial.println("\\nConnected!");',
      '}',
      '',
      'void loop() {',
      '  if(WiFi.status() == WL_CONNECTED) {',
      '    HTTPClient http;',
      '    http.begin(api_url);',
      '    http.addHeader("Content-Type", "application/json");',
      '    http.addHeader("api-key", api_key);',
      '    int niveau = random(10, 95);',
      '    float temp = 22.0 + (random(0, 50) / 10.0);',
      '    float ph = 4.0 + (random(0, 15) / 10.0);',
      '    String payload = "{\\"dataSource\\":\\"Cluster0\\",\\"database\\":\\"olipack_db\\",\\"collection\\":\\"sensors\\",\\"document\\":{";',
      '    payload += "\\"deviceId\\":\\"OP-001\\",\\"niveau\\":" + String(niveau) + ",\\"temp\\":" + String(temp);',
      '    payload += ",\\"ph\\":" + String(ph) + ",\\"timestamp\\":\\"" + String(millis()) + "\\"";',
      '    payload += "}}";',
      '    http.POST(payload);',
      '    http.end();',
      '  }',
      '  delay(10000);',
      '}'
    ].join('\n');
  };

  const arduinoCode = getArduinoCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 text-slate-900">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cpu className="text-emerald-600" />
            OliPack Connect : Setup Wokwi
          </h1>
          <p className="text-slate-500 mt-2">Préparez votre Jumeau Numérique.</p>
        </div>
        <a 
          href="https://wokwi.com/projects/new/esp32" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          Créer Projet Wokwi <ExternalLink className="w-4 h-4" />
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-cyan-600">
              <Monitor className="w-5 h-5" /> 1. Configuration
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-mono text-slate-700">
                Wokwi-GUEST
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
                <Terminal className="text-cyan-400 w-4 h-4" /> sketch.ino
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="p-6 overflow-x-auto max-h-[500px]">
              <pre className="text-emerald-400 font-mono text-[10px] md:text-xs leading-relaxed">
                {arduinoCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareSetup;
