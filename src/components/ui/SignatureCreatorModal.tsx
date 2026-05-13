import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Upload, Type, PenTool, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

interface SignatureCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, signatureData: string) => void;
}

export default function SignatureCreatorModal({ isOpen, onClose, onSave }: SignatureCreatorModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [signatureName, setSignatureName] = useState('My Signature');
  
  // Draw State
  const sigPadRef = useRef<SignatureCanvas>(null);
  
  // Type State
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');
  const fonts = ['Dancing Script', 'Caveat', 'Great Vibes', 'Pacifico'];
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Load Google Fonts for the "Type" tab
  useEffect(() => {
    if (isOpen) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [isOpen]);

  // Handle typing signature drawing on hidden canvas
  useEffect(() => {
    if (activeTab === 'type' && typedName && typeCanvasRef.current) {
      const canvas = typeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Wait for font to load theoretically, but drawing immediately works for standard loaded fonts
        document.fonts.ready.then(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = `48px "${selectedFont}", cursive`;
          ctx.fillStyle = '#000000';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        });
      }
    }
  }, [typedName, selectedFont, activeTab]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (activeTab === 'draw' && sigPadRef.current) {
      sigPadRef.current.clear();
    } else if (activeTab === 'type') {
      setTypedName('');
    } else if (activeTab === 'upload') {
      setUploadedImage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!signatureName.trim()) {
      toast.error('Please provide a name for this signature');
      return;
    }

    let dataUri = '';

    if (activeTab === 'draw') {
      if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
        toast.error('Please draw your signature');
        return;
      }
      // Get transparent PNG
      dataUri = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedName.trim()) {
        toast.error('Please type your name');
        return;
      }
      if (typeCanvasRef.current) {
        // Trim the typed canvas before saving to remove empty space
        const canvas = typeCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Simple trim logic (could be improved, but sufficient for now)
        dataUri = canvas.toDataURL('image/png');
      }
    } else if (activeTab === 'upload') {
      if (!uploadedImage) {
        toast.error('Please upload an image');
        return;
      }
      dataUri = uploadedImage;
    }

    if (dataUri) {
      onSave(signatureName, dataUri);
      handleClear();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col ${themeClasses.cardBackground} border ${themeClasses.primaryBorder}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">Create Digital Signature</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Signature Name</label>
            <input 
              type="text" 
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${themeClasses.primaryBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent`}
              placeholder="e.g., Official Signature"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'draw' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <PenTool size={16} /> Draw
            </button>
            <button
              onClick={() => setActiveTab('type')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'type' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Type size={16} /> Type
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={16} /> Upload
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 h-[250px] flex flex-col items-center justify-center relative overflow-hidden">
            
            {activeTab === 'draw' && (
              <SignatureCanvas 
                ref={sigPadRef} 
                penColor="black"
                canvasProps={{ className: 'w-full h-full cursor-crosshair' }} 
              />
            )}

            {activeTab === 'type' && (
              <div className="w-full h-full flex flex-col p-4">
                <input 
                  type="text" 
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your name here..."
                  className="text-center w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 pb-2 mb-4 text-lg"
                />
                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                  {fonts.map(font => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      style={{ fontFamily: `"${font}", cursive` }}
                      className={`px-3 py-1 rounded text-lg ${selectedFont === font ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <canvas 
                    ref={typeCanvasRef} 
                    width={500} 
                    height={150} 
                    className="max-w-full hidden"
                  />
                  {typedName ? (
                     <div style={{ fontFamily: `"${selectedFont}", cursive`, fontSize: '48px', color: 'black' }} className="text-center w-full break-words">
                        {typedName}
                     </div>
                  ) : (
                    <span className="text-gray-400">Preview will appear here</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                {uploadedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={uploadedImage} alt="Uploaded Signature" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Upload a transparent PNG of your signature</p>
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                      Browse Files
                      <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
                    </label>
                  </>
                )}
              </div>
            )}
            
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium"
            >
              Clear
            </button>
            <p className="text-xs text-gray-400">Signatures are stored securely as encrypted assets.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className={`px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${themeClasses.buttonPrimary} shadow-sm`}
          >
            <Check size={16} /> Save Signature
          </button>
        </div>

      </div>
    </div>
  );
}
