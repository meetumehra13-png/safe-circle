import React, { useState } from 'react';
import { Users, UserPlus, Star, Trash2, Edit2, PhoneCall, MessageSquare } from 'lucide-react';
import type { TrustedContact, LocationData } from '../types';
import { generateEmergencySMS } from '../utils/distance';

interface TrustedContactsProps {
  contacts: TrustedContact[];
  onSaveContacts: (contacts: TrustedContact[]) => void;
  location: LocationData | null;
}

export const TrustedContacts: React.FC<TrustedContactsProps> = ({
  contacts,
  onSaveContacts,
  location,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');

  const openNewForm = () => {
    setName('');
    setPhone('');
    setRelationship('Family');
    setIsPrimary(contacts.length === 0);
    setNotes('');
    setEditingId(null);
    setShowAddModal(true);
  };

  const openEditForm = (c: TrustedContact) => {
    setName(c.name);
    setPhone(c.phone);
    setRelationship(c.relationship);
    setIsPrimary(c.isPrimary);
    setNotes(c.notes || '');
    setEditingId(c.id);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let updatedList = [...contacts];

    if (isPrimary) {
      updatedList = updatedList.map(c => ({ ...c, isPrimary: false }));
    }

    if (editingId) {
      updatedList = updatedList.map(c =>
        c.id === editingId
          ? { ...c, name, phone, relationship, isPrimary, notes }
          : c
      );
    } else {
      const newContact: TrustedContact = {
        id: 'c_' + Date.now(),
        name,
        phone,
        relationship,
        isPrimary,
        notes,
        createdAt: Date.now(),
      };
      updatedList.push(newContact);
    }

    onSaveContacts(updatedList);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onSaveContacts(updated);
  };

  const handleMakePrimary = (id: string) => {
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    onSaveContacts(updated);
  };

  const smsText = generateEmergencySMS(location, 'Test Emergency Notification');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Trusted Emergency Contacts
            </h2>
            <p className="text-xs text-slate-400">
              People who will receive immediate SMS alerts and live GPS tracking when SOS is triggered.
            </p>
          </div>
        </div>

        <button
          onClick={openNewForm}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Trusted Contacts Added</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Add at least one family member or friend to ensure someone is notified during an emergency.
          </p>
          <button
            onClick={openNewForm}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(c => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                c.isPrimary
                  ? 'bg-blue-950/30 border-blue-500/50 shadow-md shadow-blue-950/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {c.isPrimary && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-extrabold uppercase bg-blue-500 text-white px-2.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-current" /> Primary
                </span>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-base shrink-0 border border-slate-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{c.name}</h3>
                  <span className="text-xs text-blue-400 font-medium">{c.relationship}</span>
                  <div className="font-mono text-xs text-slate-300 mt-0.5">{c.phone}</div>
                </div>
              </div>

              {c.notes && (
                <p className="text-xs text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 mb-3 italic">
                  "{c.notes}"
                </p>
              )}

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1 font-semibold"
                    title="Test Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={`sms:${c.phone}?body=${encodeURIComponent(smsText)}`}
                    className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 font-semibold"
                    title="Test SMS"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> SMS
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {!c.isPrimary && (
                    <button
                      onClick={() => handleMakePrimary(c.id)}
                      className="text-[11px] text-slate-400 hover:text-blue-400 font-semibold"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => openEditForm(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Trusted Contact' : 'Add New Trusted Contact'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 555 019 2834"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Family">Family / Relative</option>
                  <option value="Spouse/Partner">Spouse / Partner</option>
                  <option value="Trusted Friend">Trusted Friend</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Neighbor">Neighbor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Has spare key, lives nearby..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={e => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="primaryCheck" className="text-slate-300 font-medium">
                  Set as Primary Contact (1st to receive direct SMS/Calls)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
