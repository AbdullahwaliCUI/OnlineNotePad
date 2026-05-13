'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { PenTool, Plus, Trash2, Download, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { signatureService } from '@/lib/database';
import SignatureCreatorModal from '@/components/ui/SignatureCreatorModal';
import toast from 'react-hot-toast';

export default function SignaturesPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadSignatures = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await signatureService.getSignatures(user.id);
      setSignatures(data);
    } catch (error) {
      console.error('Error loading signatures', error);
      toast.error('Failed to load signatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this signature? This action cannot be undone.')) {
      const success = await signatureService.deleteSignature(id);
      if (success) {
        toast.success('Signature deleted');
        setSignatures(signatures.filter(s => s.id !== id));
      } else {
        toast.error('Failed to delete signature');
      }
    }
  };

  const handleDownload = (signatureData: string, name: string) => {
    const a = document.createElement('a');
    a.href = signatureData;
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async (signatureData: string, id: string) => {
    try {
      // Create an image element to draw onto canvas
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = signatureData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create blob');
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        toast.success('Signature copied to clipboard!');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } catch (err) {
      console.error('Failed to copy image: ', err);
      toast.error('Failed to copy image to clipboard. Try downloading instead.');
    }
  };

  const handleSaveNewSignature = async (name: string, signatureData: string) => {
    if (!user) return;
    const newSig = await signatureService.createSignature({
      user_id: user.id,
      name,
      signature_data: signatureData
    });

    if (newSig) {
      toast.success('Signature saved successfully!');
      setShowCreator(false);
      loadSignatures(); // Reload
    } else {
      toast.error('Failed to save signature');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PenTool className={themeClasses.iconColor} />
                Digital Signatures Vault
              </h1>
              <p className="text-gray-500 mt-1">Manage, download, and copy your digital signatures.</p>
            </div>
            
            <button
              onClick={() => setShowCreator(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md ${themeClasses.buttonPrimary}`}
            >
              <Plus size={20} />
              Create Signature
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.primaryBorder}`}></div>
            </div>
          ) : signatures.length === 0 ? (
            <div className={`flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed ${themeClasses.cardBackground} ${themeClasses.primaryBorder}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-800`}>
                <PenTool className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Signatures Yet</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Create your first digital signature. You can draw it, type it with cursive fonts, or upload a scanned image.
              </p>
              <button
                onClick={() => setShowCreator(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md ${themeClasses.buttonPrimary}`}
              >
                <Plus size={20} />
                Create Your First Signature
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signatures.map((sig) => (
                <div 
                  key={sig.id} 
                  className={`rounded-xl border ${themeClasses.primaryBorder} ${themeClasses.cardBackground} overflow-hidden shadow-sm hover:shadow-md transition-shadow group`}
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-center items-center h-48 relative">
                    {/* Action Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <button 
                        onClick={() => handleCopy(sig.signature_data, sig.id)}
                        className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform tooltip-container"
                        title="Copy to Clipboard"
                      >
                        {copiedId === sig.id ? <CheckCircle className="text-green-500" size={20} /> : <Copy size={20} />}
                      </button>
                      <button 
                        onClick={() => handleDownload(sig.signature_data, sig.name)}
                        className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:scale-110 transition-transform tooltip-container"
                        title="Download PNG"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                    
                    <img 
                      src={sig.signature_data} 
                      alt={sig.name} 
                      className="max-h-full max-w-full object-contain p-4" 
                    />
                  </div>
                  
                  <div className="p-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{sig.name}</h3>
                      <p className="text-xs text-gray-500">Created {new Date(sig.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(sig.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Signature"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      <SignatureCreatorModal 
        isOpen={showCreator} 
        onClose={() => setShowCreator(false)} 
        onSave={handleSaveNewSignature} 
      />
    </ProtectedRoute>
  );
}
