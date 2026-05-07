import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { 
  QrCode, 
  Barcode as BarcodeIcon, 
  Download, 
  Copy, 
  Share2, 
  Trash2, 
  Wifi, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  Type, 
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, downloadAsPng, copyToClipboard } from './lib/utils';

type Mode = 'QR' | 'BARCODE';
type QRType = 'TEXT' | 'URL' | 'WIFI' | 'EMAIL' | 'PHONE';

export default function App() {
  const [mode, setMode] = useState<Mode>('QR');
  const [qrType, setQrType] = useState<QRType>('TEXT');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13' | 'UPC'>('CODE128');
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // WiFi-specific state
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');

  // Email-specific state
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // Update input based on specific fields for complex types
  useEffect(() => {
    if (qrType === 'WIFI') {
      if (ssid) {
        setInput(`WIFI:T:${encryption};S:${ssid};P:${password};;`);
      } else {
        setInput('');
      }
    } else if (qrType === 'EMAIL') {
      if (emailAddress) {
        setInput(`MATMSG:TO:${emailAddress};SUB:${emailSubject};BODY:${emailMessage};;`);
      } else {
        setInput('');
      }
    } else if (qrType === 'PHONE') {
      if (input.startsWith('tel:')) {
          // keep as is
      } else if (input) {
          setInput(`tel:${input}`);
      }
    }
  }, [qrType, ssid, password, encryption, emailAddress, emailSubject, emailMessage]);

  // Handle Barcode rendering to canvas
  useEffect(() => {
    if (mode === 'BARCODE' && input && barcodeCanvasRef.current) {
      try {
        JsBarcode(barcodeCanvasRef.current, input, {
          format: barcodeFormat,
          width: 2,
          height: 100,
          displayValue: true,
          font: 'Space Grotesk',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 10,
          fontSize: 16,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10
        });
      } catch (err) {
        console.error('Barcode generation error:', err);
      }
    }
  }, [mode, input, barcodeFormat]);

  const handleClear = () => {
    setInput('');
    setSsid('');
    setPassword('');
    setEmailAddress('');
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleCopy = async () => {
    if (mode === 'QR') {
      const success = await copyToClipboard('qr-canvas');
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
       const success = await copyToClipboard('barcode-canvas');
       if (success) {
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
       }
    }
  };

  const handleDownload = () => {
    const id = mode === 'QR' ? 'qr-canvas' : 'barcode-canvas';
    const name = `quickqr-${mode.toLowerCase()}-${Date.now()}.png`;
    downloadAsPng(id, name);
  };

  const handleShare = async () => {
    const id = mode === 'QR' ? 'qr-canvas' : 'barcode-canvas';
    if (navigator.share) {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
      if (blob) {
        const file = new File([blob], `${mode.toLowerCase()}.png`, { type: 'image/png' });
        try {
          await navigator.share({
            files: [file],
            title: 'QuickQR Generation',
            text: 'Generated with QuickQR'
          });
        } catch (err) {
          console.error('Share failed:', err);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-neo-bg">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Header Section */}
        <header className="w-full flex justify-between items-end mb-8 relative">
          <div className="flex flex-col gap-1">
            <div className="badge w-fit mb-2">v1.0.4 - OFFLINE READY</div>
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none"
            >
              Quick<span className="text-neo-primary">QR</span>
            </motion.h1>
            <p className="text-lg font-bold opacity-80 italic">Instantly generate codes entirely on-device.</p>
          </div>
          
          <div className="neo-card px-4 py-2 flex items-center gap-4 h-fit bg-white hidden md:flex">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-gray-500">PRIVACY STATUS</div>
              <div className="text-sm font-bold text-green-700 uppercase flex items-center gap-1 leading-none">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div> 100% Local Only
              </div>
            </div>
          </div>
        </header>

        {/* Main Interface Grid */}
        <main className="neo-card p-6 md:p-10 grid md:grid-cols-2 gap-12 w-full">
          
          {/* Input Area */}
          <section className="flex flex-col gap-6">
            <div className="flex gap-2 p-1 border-4 border-black bg-white rounded-xl w-fit">
              <button 
                onClick={() => { setMode('QR'); handleClear(); }}
                className={cn(
                  "px-6 py-2 rounded-lg font-black uppercase text-sm transition-all",
                  mode === 'QR' ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                )}
              >
                QR Code
              </button>
              <button 
                onClick={() => { setMode('BARCODE'); handleClear(); }}
                className={cn(
                  "px-6 py-2 rounded-lg font-black uppercase text-sm transition-all",
                  mode === 'BARCODE' ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                )}
              >
                Barcode
              </button>
            </div>

            {mode === 'QR' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(['TEXT', 'URL', 'WIFI', 'EMAIL', 'PHONE'] as QRType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setQrType(type);
                        handleClear();
                      }}
                      className={cn(
                        "p-2 neo-border-sm transition-all relative group",
                        qrType === type ? "bg-neo-primary text-white" : "bg-white hover:bg-neo-accent"
                      )}
                      title={type}
                    >
                      {type === 'TEXT' && <Type size={20} />}
                      {type === 'URL' && <LinkIcon size={20} />}
                      {type === 'WIFI' && <Wifi size={20} />}
                      {type === 'EMAIL' && <Mail size={20} />}
                      {type === 'PHONE' && <Phone size={20} />}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full px-1 bg-black text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {type}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {qrType === 'TEXT' && (
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase">Input Data</label>
                      <textarea
                        value={input}
                        onInput={(e) => setInput(e.currentTarget.value)}
                        placeholder="Type your message here..."
                        className="w-full h-32 neo-input resize-none text-xl"
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase opacity-60">
                          {input.length} / 2048 CHARACTERS
                        </span>
                        <button 
                          onClick={handleClear}
                          className="text-[10px] font-black uppercase underline hover:text-neo-primary transition-colors"
                        >
                          CLEAR DATA
                        </button>
                      </div>
                    </div>
                  )}

                  {qrType === 'URL' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase">Website Link</label>
                      <input
                        type="url"
                        value={input}
                        onInput={(e) => setInput(e.currentTarget.value)}
                        placeholder="https://google.com"
                        className="w-full neo-input"
                      />
                    </div>
                  )}

                  {qrType === 'WIFI' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase">Security</label>
                        <div className="flex gap-2">
                          {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                            <button
                              key={enc}
                              onClick={() => setEncryption(enc)}
                              className={cn(
                                "flex-1 py-1.5 text-[10px] font-black neo-border-sm transition-all",
                                encryption === enc ? "bg-neo-primary text-white" : "bg-white hover:bg-neo-accent"
                              )}
                            >
                              {enc === 'nopass' ? 'PUBLIC' : enc}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase">SSID (Network Name)</label>
                        <input
                          type="text"
                          value={ssid}
                          onInput={(e) => setSsid(e.currentTarget.value)}
                          placeholder="Home_WiFi"
                          className="w-full neo-input"
                        />
                      </div>
                      {encryption !== 'nopass' && (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase">Password</label>
                          <input
                            type="text"
                            value={password}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            placeholder="••••••••"
                            className="w-full neo-input"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {qrType === 'EMAIL' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase">Recipient</label>
                        <input
                          type="email"
                          value={emailAddress}
                          onInput={(e) => setEmailAddress(e.currentTarget.value)}
                          placeholder="hello@world.com"
                          className="w-full neo-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onInput={(e) => setEmailSubject(e.currentTarget.value)}
                          placeholder="Subject line"
                          className="w-full neo-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase">Body</label>
                        <textarea
                          value={emailMessage}
                          onInput={(e) => setEmailMessage(e.currentTarget.value)}
                          placeholder="Email content..."
                          className="w-full h-24 neo-input resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {qrType === 'PHONE' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase">Phone Number</label>
                      <input
                        type="tel"
                        value={input.replace('tel:', '')}
                        onInput={(e) => setInput(`tel:${e.currentTarget.value}`)}
                        placeholder="+33 000 000 000"
                        className="w-full neo-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'BARCODE' && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  {(['CODE128', 'EAN13', 'UPC'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => { setBarcodeFormat(format); setInput(''); }}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black neo-border-sm transition-all",
                        barcodeFormat === format ? "bg-neo-primary text-white" : "bg-white hover:bg-neo-accent"
                      )}
                    >
                      {format}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Value</label>
                  <input
                    type="text"
                    value={input}
                    onInput={(e) => setInput(e.currentTarget.value)}
                    placeholder={barcodeFormat === 'EAN13' ? '13 digits...' : 'Enter value...'}
                    className="w-full neo-input uppercase"
                  />
                  <div className="mt-2 p-3 bg-blue-50 neo-border-sm border-blue-200">
                    <p className="text-[10px] font-bold text-blue-800 leading-tight">
                      {barcodeFormat === 'EAN13' && "Requires exactly 13 numeric digits."}
                      {barcodeFormat === 'UPC' && "Requires exactly 12 numeric digits."}
                      {barcodeFormat === 'CODE128' && "Supports alphanumeric characters."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4 border-t-4 border-black/10 pt-4">
              <label className="text-sm font-black uppercase">Configuration</label>
              <div className="grid grid-cols-2 gap-3">
                 <button className="neo-button-secondary text-[10px] uppercase">Default Layout</button>
                 <button className="neo-button-secondary opacity-40 text-[10px] uppercase bg-white cursor-not-allowed">Custom Colors</button>
              </div>
            </div>
          </section>

          {/* Preview & Output Area */}
          <section className="flex flex-col items-center justify-center gap-6 bg-white border-4 border-black rounded-xl p-8 relative min-h-[400px]">
             <div className="absolute top-4 left-4 badge">PREVIEW</div>
             
             <div className="w-full h-fit flex flex-col items-center justify-center">
               <AnimatePresence mode="wait">
                 {input ? (
                   <motion.div 
                     key={input + mode + barcodeFormat}
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     className="relative z-10 p-2 border-2 border-black/5"
                   >
                     {mode === 'QR' ? (
                       <QRCodeCanvas
                         id="qr-canvas"
                         value={input}
                         size={220}
                         level="H"
                         includeMargin={true}
                       />
                     ) : (
                       <canvas 
                         id="barcode-canvas" 
                         ref={barcodeCanvasRef}
                         className="max-w-full h-auto"
                       />
                     )}
                   </motion.div>
                 ) : (
                   <div className="text-center opacity-20 py-10">
                      <div className="mb-4 flex justify-center">
                        {mode === 'QR' ? <QrCode size={80} /> : <BarcodeIcon size={80} />}
                      </div>
                      <p className="font-black uppercase text-lg">Waiting for data</p>
                   </div>
                 )}
               </AnimatePresence>
            </div>

            <div className="flex flex-col w-full gap-3 mt-auto">
              <button 
                disabled={!input}
                onClick={handleDownload}
                className={cn(
                  "neo-button w-full flex items-center justify-center gap-2",
                  !input ? "bg-gray-100 cursor-not-allowed opacity-50 grayscale" : "bg-neo-primary text-white"
                )}
              >
                <Download size={20} />
                <span>DOWNLOAD AS PNG</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={!input}
                  onClick={handleCopy}
                  className={cn(
                     "neo-button-secondary text-xs uppercase flex items-center justify-center gap-2",
                     !input ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copied ? 'COPIED' : 'Copy Image'}
                </button>
                <button 
                  disabled={!input}
                  onClick={handleShare}
                  className={cn(
                     "neo-button-secondary text-xs uppercase flex items-center justify-center gap-2",
                     !input ? "opacity-30 cursor-not-allowed" : ""
                  )}
                >
                  <Share2 size={16} />
                  <span>Share Link</span>
                </button>
              </div>
            </div>
          </section>

        </main>

        <footer className="mt-12 w-full flex justify-between items-center opacity-80">
          <div className="flex gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Geometric Stack v4.2</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 hidden md:inline">|</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Built for instant sharing</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-red-600 border-2 border-black rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 border-2 border-black rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
