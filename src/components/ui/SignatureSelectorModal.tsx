import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { signatureService } from '@/lib/database';
import SignatureCreatorModal from './SignatureCreatorModal';
import toast from 'react-hot-toast';

interface SignatureSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (signatureData: string) => void;
}

export default function SignatureSelectorModal({ isOpen, onClose, onSelect }: SignatureSelectorModalProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { user } = useAuth();
  
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

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
    if (isOpen) {
      loadSignatures();
    }
  }, [isOpen, user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this signature?')) {
      const success = await signatureService.deleteSignature(id);
      if (success) {
        toast.success('Signature deleted');
        setSignatures(signatures.filter(s => s.id !== id));
      } else {
        toast.error('Failed to delete signature');
      }
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
      loadSignatures(); // Reload list
    } else {
      toast.error('Failed to save signature');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col ${themeClasses.cardBackground} border ${themeClasses.primaryBorder} max-h-[80vh]`}>
          
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold">Select Signature</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : signatures.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-blue-500" size={32} />
                </div>
                <h3 className="text-lg font-medium mb-2">No Signatures Found</h3>
                <p className="text-gray-500 mb-6">Create your first digital signature to use in documents.</p>
                <button 
                  onClick={() => setShowCreator(true)}
                  className={`px-4 py-2 rounded-lg font-medium text-white ${themeClasses.buttonPrimary}`}
                >
                  Create Signature
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Create New Card */}
                <div 
                  onClick={() => setShowCreator(true)}
                  className={`border-2 border-dashed ${themeClasses.primaryBorder} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[160px]`}
                >
                  <Plus className="text-gray-400 mb-2" size={32} />
                  <span className="font-medium text-gray-600 dark:text-gray-300">Create New</span>
                </div>

                {/* Signature Cards */}
                {signatures.map(sig => (
                  <div 
                    key={sig.id}
                    onClick={() => onSelect(sig.signature_data)}
                    className={`border ${themeClasses.primaryBorder} rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all relative group bg-white dark:bg-gray-900 min-h-[160px]`}
                  >
                    <button 
                      onClick={(e) => handleDelete(e, sig.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="flex-1 w-full flex items-center justify-center p-2 mb-2">
                      <img src={sig.signature_data} alt={sig.name} className="max-h-20 max-w-full object-contain" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full text-center truncate px-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                      {sig.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SignatureCreatorModal 
        isOpen={showCreator} 
        onClose={() => setShowCreator(false)} 
        onSave={handleSaveNewSignature} 
      />
    </>
  );
}
