'use client';

import { useState, useEffect, useRef } from 'react';
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
} from 'qr-code-styling';
import { useTheme } from '@/contexts/ThemeContext';
import DashboardHeader from '@/components/DashboardHeader';
import { Copy, Download, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'Text' | 'URL' | 'WhatsApp' | 'Email' | 'Phone';

interface QRHistoryItem {
  id: string;
  type: Tab;
  content: string;
  timestamp: number;
}

export default function QRGeneratorPage() {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('URL');
  const [content, setContent] = useState('');
  
  // Style settings
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [dotColor, setDotColor] = useState<string>('#1a73e8');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('extra-rounded');
  const [cornerSquareColor, setCornerSquareColor] = useState<string>('#1a73e8');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot');
  const [cornerDotColor, setCornerDotColor] = useState<string>('#1a73e8');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>('Q');
  const [logo, setLogo] = useState<string>('');
  const [size, setSize] = useState<number>(300);
  const [margin, setMargin] = useState<number>(10);

  const [history, setHistory] = useState<QRHistoryItem[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load history
    const savedHistory = localStorage.getItem('qr_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse QR history');
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        data: getFormattedContent() || 'https://example.com',
        margin: margin,
        qrOptions: {
          typeNumber: 0 as TypeNumber,
          mode: 'Byte' as Mode,
          errorCorrectionLevel: errorCorrectionLevel
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
          crossOrigin: 'anonymous',
        },
        dotsOptions: {
          type: dotType,
          color: dotColor
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        image: logo,
        cornersSquareOptions: {
          type: cornerSquareType,
          color: cornerSquareColor,
        },
        cornersDotOptions: {
          type: cornerDotType,
          color: cornerDotColor,
        }
      });

      if (ref.current) {
        ref.current.innerHTML = '';
        qrCode.current.append(ref.current);
      }
    }
  }, [mounted, size, margin, dotType, dotColor, cornerSquareType, cornerSquareColor, cornerDotType, cornerDotColor, backgroundColor, errorCorrectionLevel, logo]);

  useEffect(() => {
    if (!qrCode.current) return;
    qrCode.current.update({
      data: getFormattedContent() || 'https://example.com'
    });
  }, [content, activeTab]);

  const getFormattedContent = () => {
    if (!content.trim()) return '';
    switch (activeTab) {
      case 'URL':
        return content.startsWith('http') ? content : `https://${content}`;
      case 'WhatsApp':
        // remove non-numeric
        const num = content.replace(/\D/g, '');
        return `https://wa.me/${num}`;
      case 'Email':
        return `mailto:${content}`;
      case 'Phone':
        return `tel:${content}`;
      default:
        return content;
    }
  };

  const handleDownload = () => {
    if (!qrCode.current) return;
    qrCode.current.download({
      extension: 'png',
      name: `qr-code-${Date.now()}`
    });
    toast.success('QR Code downloaded!');
  };

  const handleCopyImage = async () => {
    if (!qrCode.current) return;
    try {
      const blob = await qrCode.current.getRawData('png');
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('QR Code copied to clipboard!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy image');
    }
  };

  const handleSaveToHistory = () => {
    if (!content.trim()) {
      toast.error('Please enter content first');
      return;
    }
    
    const newItem: QRHistoryItem = {
      id: Date.now().toString(),
      type: activeTab,
      content: getFormattedContent(),
      timestamp: Date.now()
    };
    
    const newHistory = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('qr_history', JSON.stringify(newHistory));
    toast.success('Saved to history');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qr_history');
    toast.success('History cleared');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs: Tab[] = ['Text', 'URL', 'WhatsApp', 'Email', 'Phone'];

  if (!mounted) return null;

  return (
    <div className={`min-h-full pb-10 ${themeClasses.background}`}>
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${themeClasses.primaryText}`}>
          Colorful QR Generator
        </h1>
        <p className={`${themeClasses.primaryText} opacity-70 text-sm sm:text-base`}>
          Design stunning, colorful QR codes with custom shapes and logos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Content Card */}
          <div className={`${themeClasses.cardBackground} rounded-xl border ${themeClasses.cardBorder} p-4 sm:p-6 shadow-sm`}>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setContent(''); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-medium ${themeClasses.primaryText}`}>QR Content</label>
                <button 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setContent(text);
                    } catch (e) {
                      toast.error('Clipboard access denied');
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                >
                  <Copy size={12} /> Paste
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Enter ${activeTab} here...`}
                className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none min-h-[120px] resize-y ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText} ${themeClasses.inputFocus}`}
              />
            </div>
          </div>

          {/* Styling & Colors Card */}
          <div className={`${themeClasses.cardBackground} rounded-xl border ${themeClasses.cardBorder} p-4 sm:p-6 shadow-sm`}>
            <h3 className={`text-base font-semibold mb-6 ${themeClasses.primaryText}`}>Styling & Colors</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Dot Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Dot Style</label>
                <select 
                  value={dotType} 
                  onChange={(e) => setDotType(e.target.value as DotType)}
                  className={`w-full p-2 rounded border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText}`}
                >
                  <option value="square">Square</option>
                  <option value="dots">Dots</option>
                  <option value="rounded">Rounded</option>
                  <option value="extra-rounded">Extra Rounded</option>
                  <option value="classy">Classy</option>
                  <option value="classy-rounded">Classy Rounded</option>
                </select>
              </div>

              {/* Corner Outline Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Corner Outline Style</label>
                <select 
                  value={cornerSquareType} 
                  onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
                  className={`w-full p-2 rounded border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText}`}
                >
                  <option value="square">Square</option>
                  <option value="dot">Dot</option>
                  <option value="extra-rounded">Extra Rounded</option>
                </select>
              </div>

              {/* Dot Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Dot Color</label>
                <div className="flex gap-2 h-10">
                  <input 
                    type="color" 
                    value={dotColor} 
                    onChange={(e) => setDotColor(e.target.value)}
                    className="h-full w-full rounded cursor-pointer p-0 border-0"
                  />
                </div>
              </div>

              {/* Corner Outline Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Corner Outline Color</label>
                <div className="flex gap-2 h-10">
                  <input 
                    type="color" 
                    value={cornerSquareColor} 
                    onChange={(e) => setCornerSquareColor(e.target.value)}
                    className="h-full w-full rounded cursor-pointer p-0 border-0"
                  />
                </div>
              </div>

              {/* Corner Inner Dot Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Corner Inner Dot Style</label>
                <select 
                  value={cornerDotType} 
                  onChange={(e) => setCornerDotType(e.target.value as CornerDotType)}
                  className={`w-full p-2 rounded border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText}`}
                >
                  <option value="square">Square</option>
                  <option value="dot">Dot</option>
                </select>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Background Color</label>
                <div className="flex gap-2 h-10">
                  <input 
                    type="color" 
                    value={backgroundColor} 
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-full w-full rounded cursor-pointer p-0 border-0"
                  />
                </div>
              </div>

              {/* Corner Inner Dot Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Corner Inner Dot Color</label>
                <div className="flex gap-2 h-10">
                  <input 
                    type="color" 
                    value={cornerDotColor} 
                    onChange={(e) => setCornerDotColor(e.target.value)}
                    className="h-full w-full rounded cursor-pointer p-0 border-0"
                  />
                </div>
              </div>

              {/* Error Correction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Error Correction Level</label>
                <select 
                  value={errorCorrectionLevel} 
                  onChange={(e) => setErrorCorrectionLevel(e.target.value as ErrorCorrectionLevel)}
                  className={`w-full p-2 rounded border focus:ring-2 outline-none ${themeClasses.cardBackground} ${themeClasses.cardBorder} ${themeClasses.primaryText}`}
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

            <hr className="my-6 border-gray-100 dark:border-gray-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Center Logo (Optional)</label>
                <div className="flex items-center gap-4">
                  <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${themeClasses.cardBorder} ${themeClasses.primaryText}`}>
                    <ImageIcon size={16} />
                    <span className="text-sm font-medium">Upload Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logo && (
                    <button onClick={() => setLogo('')} className="text-red-500 text-sm hover:underline">Remove</button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Tip: Use Quartile or High error correction when adding a logo.</p>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Size: {size}px</span>
                  </div>
                  <input type="range" min="100" max="600" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Margin: {margin}</span>
                  </div>
                  <input type="range" min="0" max="50" step="1" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Preview Card */}
          <div className={`${themeClasses.cardBackground} rounded-xl border ${themeClasses.cardBorder} p-4 sm:p-6 shadow-sm sticky top-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-base font-semibold ${themeClasses.primaryText}`}>Live Preview</h3>
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-100 p-2 sm:p-4 mb-4 flex items-center justify-center overflow-hidden min-h-[300px]">
              <div ref={ref} className="w-full flex items-center justify-center" style={{ maxWidth: '100%', overflow: 'hidden' }}></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download size={16} /> Download PNG
              </button>
              <button
                onClick={handleCopyImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-gray-700 dark:text-gray-300"
              >
                <Copy size={16} /> Copy Image
              </button>
            </div>
            <button
              onClick={handleSaveToHistory}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-gray-700 dark:text-gray-300"
            >
              <Save size={16} /> Save to History
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className={`mt-8 ${themeClasses.cardBackground} rounded-xl border ${themeClasses.cardBorder} p-4 sm:p-6 shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-base font-semibold ${themeClasses.primaryText}`}>History</h3>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-gray-400 hover:text-red-500" title="Clear History">
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No QR codes saved yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">
                    {item.type}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={item.content}>
                    {item.content}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab(item.type);
                    setContent(item.content);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-2 sm:mt-0 text-sm text-blue-600 hover:underline shrink-0"
                >
                  Load to Editor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
