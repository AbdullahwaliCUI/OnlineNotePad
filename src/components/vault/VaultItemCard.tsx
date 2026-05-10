'use client';

import { useState } from 'react';
import { VaultItem } from '@/types/vault';
import { Copy, Eye, EyeOff, ExternalLink, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VaultItemCardProps {
  item: VaultItem;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export default function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {item.title}
            {item.url && (
              <a 
                href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Visit URL"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </h3>
          {item.username && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="font-medium">User:</span> 
              <span>{item.username}</span>
              <button 
                onClick={() => copyToClipboard(item.username!, 'Username')}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Copy username"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete(item.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {item.password && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-sm font-medium text-gray-500">Pass:</span>
            <span className="font-mono text-sm tracking-widest text-gray-800 truncate">
              {showPassword ? item.password : '••••••••••••'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button 
              onClick={() => copyToClipboard(item.password!, 'Password')}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Copy password"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      {item.notes && (
        <div className="mt-3 text-sm text-gray-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
          {item.notes}
        </div>
      )}
    </div>
  );
}
