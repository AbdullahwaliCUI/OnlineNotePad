'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contactService } from '@/lib/database';
import { Contact } from '@/types/database';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import { Users, Plus, Search, MoreVertical, MessageCircle, FileDown, FileUp, UploadCloud, RefreshCw, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import ContactModal from '@/components/contacts/ContactModal';

export default function ContactsPage() {
  const { user } = useAuth();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, accessToken, connect, isConnecting } = useGoogleDrive();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  
  // WhatsApp default message state
  const [waMessage, setWaMessage] = useState('AssalamuAlikum');

  // Load waMessage from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wa_default_msg');
    if (saved) {
      setWaMessage(saved);
    }
  }, []);

  const handleWaMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaMessage(e.target.value);
    localStorage.setItem('wa_default_msg', e.target.value);
  };

  const fetchContacts = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await contactService.getContacts(user.id);
    setContacts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  // Check URL params to auto-open modal
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      handleOpenModal();
      // Clear param
      window.history.replaceState({}, '', '/dashboard/contacts');
    }
  }, [searchParams]);

  const handleOpenModal = (contact?: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(undefined);
  };

  const handleSaveContact = async (contactData: any) => {
    if (!user) return;

    try {
      if (editingContact) {
        // Update
        const updated = await contactService.updateContact(editingContact.id, contactData);
        if (updated) {
          setContacts(contacts.map(c => c.id === updated.id ? updated : c));
          toast.success('Contact updated');
        }
      } else {
        // Create
        const newContact = await contactService.createContact({
          ...contactData,
          user_id: user.id
        });
        if (newContact) {
          setContacts([newContact, ...contacts]);
          toast.success('Contact added');
        }
      }
      handleCloseModal();
    } catch (e) {
      toast.error('Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    const success = await contactService.deleteContact(id);
    if (success) {
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    } else {
      toast.error('Failed to delete contact');
    }
  };

  // WhatsApp Integration
  const handleWhatsApp = (phone: string | null) => {
    if (!phone) {
      toast.error('No phone number saved for this contact');
      return;
    }
    // Clean phone number: remove anything that is not a digit or +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
  };

  // CSV Import/Export
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Phone,Email,Company,Notes\nJohn Doe,+1234567890,john@example.com,Acme Corp,Met at conference";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "NotepadX_Contacts_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const imports = results.data.map((row: any) => ({
            user_id: user.id,
            name: row.Name || 'Unknown',
            phone: row.Phone || null,
            email: row.Email || null,
            company: row.Company || null,
            notes: row.Notes || null,
          }));

          toast.loading('Importing contacts...', { id: 'import' });
          const created = await contactService.createContactsBulk(imports);
          
          if (created) {
            setContacts([...created, ...contacts]);
            toast.success(`Imported ${created.length} contacts!`, { id: 'import' });
          } else {
            toast.error('Failed to import contacts', { id: 'import' });
          }
        } catch (err) {
          toast.error('Error parsing CSV file', { id: 'import' });
        }
      }
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGoogleSync = async () => {
    if (!isConnected || !accessToken) {
      // Prompt them to connect first
      connect();
      return;
    }
    
    if (!user) return;

    try {
      toast.loading('Fetching Google Contacts...', { id: 'gsync' });
      
      const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Google Contacts API not enabled. Please enable People API in Google Cloud Console.');
        }
        throw new Error('Failed to fetch from Google');
      }

      const data = await res.json();
      const connections = data.connections || [];
      
      if (connections.length === 0) {
        toast.success('No contacts found in Google Contacts.', { id: 'gsync' });
        return;
      }

      // Map Google contacts to our Contact type
      const imports = connections.map((conn: any) => {
        const name = conn.names?.[0]?.displayName || 'Unknown';
        const email = conn.emailAddresses?.[0]?.value || null;
        const phone = conn.phoneNumbers?.[0]?.value || null;
        const company = conn.organizations?.[0]?.name || null;
        
        return {
          user_id: user.id,
          name,
          email,
          phone,
          company,
          notes: 'Imported from Google Contacts',
        };
      });

      toast.loading(`Importing ${imports.length} contacts...`, { id: 'gsync' });
      const created = await contactService.createContactsBulk(imports);
      
      if (created) {
        setContacts([...created, ...contacts]);
        toast.success(`Successfully synced ${created.length} contacts!`, { id: 'gsync' });
      } else {
        toast.error('Database import failed', { id: 'gsync' });
      }

    } catch (e: any) {
      console.error('Google Sync Error:', e);
      toast.error(e.message || 'Error syncing Google Contacts', { id: 'gsync' });
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-emerald-500" />
            Phone Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your contacts, bulk import, and chat instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadTemplate()}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FileDown size={16} /> Template
          </button>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FileUp size={16} /> Import
          </button>
          
          <button
            onClick={handleGoogleSync}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw size={16} className={isConnecting ? "animate-spin" : ""} /> 
            Google Sync
          </button>

          <button
            onClick={() => handleOpenModal()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${themeClasses.buttonPrimary}`}
          >
            <Plus size={16} /> New Contact
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contacts by name, phone, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 dark:text-gray-200"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto text-sm">
            <span className="text-gray-500 whitespace-nowrap">WhatsApp Default:</span>
            <input 
              type="text" 
              value={waMessage}
              onChange={handleWaMessageChange}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 min-w-[150px] outline-none focus:border-emerald-500"
              placeholder="e.g. AssalamuAlikum"
            />
          </div>
        </div>
      </div>

      {/* Contact List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No contacts found</h3>
          <p className="text-gray-500 mb-4">Get started by creating a new contact or importing from Excel/CSV.</p>
          <button
            onClick={() => handleOpenModal()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.buttonPrimary}`}
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow p-5 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Actions Dropdown / Icons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(contact)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title="Edit Contact"
                  >
                    <Settings size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Contact"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{contact.name}</h3>
                {contact.company && <p className="text-sm text-gray-500 truncate mb-2">{contact.company}</p>}
                
                <div className="space-y-1.5 mt-3 text-sm">
                  {contact.phone && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="w-5 text-gray-400">📞</span>
                      <span className="truncate">{contact.phone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="w-5 text-gray-400">✉️</span>
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.notes && (
                    <div className="flex items-start mt-2 text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-xs line-clamp-2">
                      {contact.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                <button
                  onClick={() => handleWhatsApp(contact.phone)}
                  disabled={!contact.phone}
                  className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    contact.phone 
                      ? 'bg-[#25D366] text-white hover:bg-[#128C7E]' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ContactModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          onSave={handleSaveContact} 
          contact={editingContact} 
        />
      )}
    </div>
  );
}
