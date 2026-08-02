import React, { useEffect, useState } from 'react';
import { staffService, type StaffBookingDetail } from '@/services/staff';
import type { Booking } from '@/services/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit2, StickyNote, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const StaffBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [query, setQuery] = useState('');
  const [pnrFilter, setPnrFilter] = useState('');
  const [loading, setLoading] = useState(true);


  // Selected booking detail for staff edit
  const [selectedDetail, setSelectedDetail] = useState<StaffBookingDetail | null>(null);
  const [newNote, setNewNote] = useState('');

  // Edit contact modal
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    loadBookings();
  }, [pnrFilter]);


  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await staffService.getBookings(query, '', pnrFilter);
      setBookings(res.items || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings for staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleSelectBooking = async (id: string) => {
    try {
      const detail = await staffService.getBookingDetail(id);
      setSelectedDetail(detail);
      setContactName(detail.booking.contact_name);
      setContactEmail(detail.booking.contact_email);
      setContactPhone(detail.booking.contact_phone);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking details');
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedDetail) return;
    try {
      await staffService.updateContact(selectedDetail.booking.id, {
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });
      toast.success('Contact info updated');
      handleSelectBooking(selectedDetail.booking.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update contact');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetail || !newNote.trim()) return;
    try {
      await staffService.addNote(selectedDetail.booking.id, newNote);
      toast.success('Internal note added');
      setNewNote('');
      handleSelectBooking(selectedDetail.booking.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    }
  };

  const handleStaffCancel = async () => {
    if (!selectedDetail) return;
    const reason = prompt('Enter staff cancellation reason:');
    if (!reason) return;
    try {
      await staffService.cancelBooking(selectedDetail.booking.id, reason);
      toast.success('Booking cancelled by staff');
      handleSelectBooking(selectedDetail.booking.id);
      loadBookings();
    } catch (err: any) {
      toast.error(err.message || 'Staff cancellation failed');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Bookings Management</h1>
          <p className="text-xs text-slate-500">Lookup, edit contact info, add notes, and process cancellations.</p>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input placeholder="PNR (e.g. ABC123)" value={pnrFilter} onChange={(e) => setPnrFilter(e.target.value)} className="w-36 text-xs bg-white uppercase font-mono" />
          <Input placeholder="Search name/email..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-48 text-xs bg-white" />
          <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1">
            <Search className="w-3.5 h-3.5" /> Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Bookings Table / List */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border shadow-xs flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">All Bookings ({bookings.length})</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Loading bookings...</p>
          ) : (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBooking(b.id)}
                  className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                    selectedDetail?.booking.id === b.id ? 'bg-purple-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-700">{b.pnr}</span>
                      <span className="font-bold text-slate-900">{b.contact_name}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{b.contact_email} • {b.contact_phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">{b.total_amount?.toLocaleString()} VND</span>
                    <p className="text-[10px] text-slate-400">{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Booking Edit Sidebar */}
        <div className="bg-white p-5 rounded-2xl border shadow-md flex flex-col gap-4">
          {!selectedDetail ? (
            <p className="text-xs text-slate-400 text-center py-12">Select a booking to view & edit</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold font-mono text-purple-700 text-sm">PNR: {selectedDetail.booking.pnr}</span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{selectedDetail.booking.status}</span>
              </div>

              {/* Edit Contact Form */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5 text-purple-600" /> Edit Contact Info
                </h3>
                <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" className="text-xs" />
                <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" className="text-xs" />
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone" className="text-xs" />
                <Button onClick={handleUpdateContact} size="sm" className="bg-purple-600 text-white text-xs font-bold w-fit">
                  Save Contact
                </Button>
              </div>

              {/* Internal Staff Notes */}
              <div className="border-t pt-3 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <StickyNote className="w-3.5 h-3.5 text-purple-600" /> Internal Notes
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] bg-slate-50 p-2 rounded-xl border">
                  {selectedDetail.notes?.map((n) => (
                    <div key={n.id} className="p-1.5 bg-white rounded border">
                      <p className="font-medium text-slate-800">{n.note}</p>
                      <span className="text-[9px] text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-1.5 mt-1">
                  <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note..." className="text-xs flex-1" />
                  <Button type="submit" size="sm" className="bg-purple-600 text-white text-xs">Add</Button>
                </form>
              </div>

              {/* Staff Cancel */}
              {selectedDetail.booking.status !== 'CANCELLED' && (
                <div className="border-t pt-3">
                  <Button onClick={handleStaffCancel} size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-1 font-bold text-xs">
                    <XCircle className="w-4 h-4" /> Cancel Booking (Staff)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
