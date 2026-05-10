'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { VaultCategory, VaultItem } from '@/types/vault';
import VaultItemCard from '@/components/vault/VaultItemCard';
import VaultItemModal from '@/components/vault/VaultItemModal';
import { Lock, Plus, Folder, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VaultPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchVaultData();
    }
  }, [user?.id]);

  const fetchVaultData = async () => {
    try {
      setLoading(true);
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('vault_categories')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (catError) throw catError;
      setCategories(catData || []);
      
      // Auto-select first category if exists
      if (catData && catData.length > 0 && !activeCategoryId) {
        setActiveCategoryId(catData[0].id);
      }

      // Fetch Items
      const { data: itemData, error: itemError } = await supabase
        .from('vault_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (itemError) throw itemError;
      setItems(itemData || []);

    } catch (error: any) {
      console.error('Error fetching vault data:', error);
      toast.error('Failed to load vault data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = window.prompt('Enter category name (e.g. Personal, Work, Banking):');
    if (!name || !name.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('vault_categories')
        .insert([{ name: name.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCategories([...categories, data]);
      setActiveCategoryId(data.id);
      toast.success('Category created!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category and all its items? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('vault_categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      if (activeCategoryId === id) {
        setActiveCategoryId(categories.length > 1 ? categories[0].id : null);
      }
      setItems(items.filter(item => item.category_id !== id));
      toast.success('Category deleted');
    } catch (error: any) {
      toast.error('Failed to delete category');
    }
  };

  const handleSaveItem = async (itemData: Partial<VaultItem>) => {
    if (!user) return;
    try {
      if (itemData.id) {
        // Update
        const { data, error } = await supabase
          .from('vault_items')
          .update(itemData)
          .eq('id', itemData.id)
          .select()
          .single();
        if (error) throw error;
        setItems(items.map(item => item.id === data.id ? data : item));
        toast.success('Item updated successfully');
      } else {
        // Insert
        const { data, error } = await supabase
          .from('vault_items')
          .insert([{ ...itemData, user_id: user.id }])
          .select()
          .single();
        if (error) throw error;
        setItems([data, ...items]);
        toast.success('Item saved securely');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('vault_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const openNewItemModal = () => {
    if (!activeCategoryId) {
      toast.error('Please create a category first');
      return;
    }
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: VaultItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = items
    .filter(item => activeCategoryId === null || item.category_id === activeCategoryId)
    .filter(item => 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse flex flex-col items-center"><ShieldCheck size={48} className="text-gray-300 mb-4" /><div className="text-gray-400">Unlocking Vault...</div></div></div>;
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / Categories */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col h-auto md:h-full flex-shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            Secure Vault
          </h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
            <button 
              onClick={handleCreateCategory}
              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
              title="Add Category"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <ul className="space-y-1">
            <li 
              className={`px-3 py-2 rounded-lg cursor-pointer text-sm font-medium flex items-center gap-3 transition-colors ${activeCategoryId === null ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveCategoryId(null)}
            >
              <Folder size={16} className={activeCategoryId === null ? 'text-blue-600' : 'text-gray-400'} />
              All Items
            </li>
            {categories.map(cat => (
              <li 
                key={cat.id}
                className={`px-3 py-2 rounded-lg cursor-pointer text-sm font-medium flex justify-between items-center group transition-colors ${activeCategoryId === cat.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveCategoryId(cat.id)}
              >
                <div className="flex items-center gap-3 truncate">
                  <Folder size={16} className={activeCategoryId === cat.id ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="truncate">{cat.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                  title="Delete category"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <div className="text-xs text-gray-400 italic px-3 py-2">No categories yet. Create one to start storing passwords.</div>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search passwords, urls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button 
            onClick={openNewItemModal}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={40} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Your vault is empty</h3>
              <p className="text-gray-500 max-w-sm mb-6">Store your passwords, usernames, and important links securely behind Supabase row-level security.</p>
              <button onClick={openNewItemModal} className="btn-primary">Add Your First Item</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <VaultItemCard 
                  key={item.id} 
                  item={item} 
                  onEdit={openEditModal} 
                  onDelete={handleDeleteItem} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <VaultItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categoryId={editingItem ? editingItem.category_id : activeCategoryId}
      />
    </div>
  );
}
