'use client';

import { useState, useEffect } from 'react';
import { VaultItem, VaultEntry } from '@/types/vault';
import { X, ShieldCheck, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
// Removed uuid import to fix build error

interface VaultItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<VaultItem>) => Promise<void>;
  item?: VaultItem | null;
  categoryId: string | null;
  defaultType?: string;
}

const CATEGORY_OPTIONS = ['Password', 'Link', 'Note', 'API Key', 'General'];

export default function VaultItemModal({ isOpen, onClose, onSave, item, categoryId, defaultType }: VaultItemModalProps) {
  const [itemType, setItemType] = useState('Password');
  const [title, setTitle] = useState('');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setItemType(item.item_type || 'Password');
      setTitle(item.title || '');
      setNotes(item.notes || '');
      
      // Handle legacy migration in UI if entries is missing/empty but legacy fields exist
      if ((!item.entries || item.entries.length === 0) && (item.username || item.password || item.url)) {
        setEntries([{
          id: Math.random().toString(36).substring(2, 15),
          productName: item.username || 'Default Entry',
          password: item.password || '',
          url: item.url || '',
          note: ''
        }]);
      } else {
        setEntries(item.entries || []);
      }
    } else {
      // Defaults for new item
      setItemType(defaultType || 'Password');
      setTitle('');
      setNotes('');
      setEntries([{ id: Math.random().toString(36).substring(2, 15), productName: '', password: '', url: '', note: '' }]);
    }
  }, [item, isOpen, defaultType]);

  if (!isOpen) return null;

  const handleAddEntry = () => {
    setEntries([...entries, { id: Math.random().toString(36).substring(2, 15), productName: '', password: '', url: '', note: '' }]);
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof VaultEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        item_type: itemType,
        entries,
        notes,
        category_id: categoryId,
        ...(item ? { id: item.id } : {})
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-2.5 rounded-xl text-green-700 mt-1">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {item ? 'Edit Vault Item' : 'Add Vault Item'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Client name ya label save karein. Password aur link categories me aik item ke neeche multiple entries add kar sakte hain.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Top Row: Category Dropdown & Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Client Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Dynamic Entries Area */}
          <div className="border border-gray-200 rounded-xl bg-gray-50/30 p-1">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={handleAddEntry}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-blue-200 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add {itemType}
              </button>
            </div>

            <div className="space-y-3 p-2">
              {entries.map((entry, index) => (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group transition-all hover:shadow-md">
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="absolute -right-2 -top-2 bg-white border border-red-100 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove entry"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder={`Product name (${index + 1})`}
                      value={entry.productName}
                      onChange={(e) => updateEntry(entry.id, 'productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white"
                    />
                    
                    {itemType === 'Link' ? (
                      <input
                        type="url"
                        placeholder={`URL (${index + 1})`}
                        value={entry.url || ''}
                        onChange={(e) => updateEntry(entry.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white"
                      />
                    ) : (
                      <input
                        type={showPasswords ? "text" : "password"}
                        placeholder={`${itemType} (${index + 1})`}
                        value={entry.password || ''}
                        onChange={(e) => updateEntry(entry.id, 'password', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white"
                      />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Product note..."
                    value={entry.note || ''}
                    onChange={(e) => updateEntry(entry.id, 'note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
              ))}
              
              {entries.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  No entries added. Click "Add {itemType}" to start.
                </div>
              )}
            </div>
          </div>

          {/* Show Passwords Toggle */}
          {itemType !== 'Link' && itemType !== 'Note' && entries.length > 0 && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                Show passwords
              </button>
            </div>
          )}

          {/* Main Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#0f766e] text-white rounded-lg font-medium hover:bg-[#0f766e]/90 transition-colors disabled:opacity-70 flex justify-center items-center shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
