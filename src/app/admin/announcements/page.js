"use client";
import { useEffect, useState } from 'react';
import { FiBell, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { getAuthHeaders } from '@/lib/apiHelpers';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/announcements', { headers });
      const data = await res.json();
      if (data.ok) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      showToast('error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders() || {});
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, message })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('success', 'Announcement created successfully');
        setTitle('');
        setMessage('');
        setShowForm(false);
        loadAnnouncements();
      } else {
        showToast('error', data.error || 'Failed to create announcement');
      }
    } catch (err) {
      showToast('error', 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('success', 'Announcement deleted successfully');
        loadAnnouncements();
      } else {
        showToast('error', data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      showToast('error', 'Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <section className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p>Loading announcements...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiBell className="w-6 h-6 text-[var(--brand)]" />
            <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/90 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            New Announcement
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Special Offer, Holiday Hours, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your announcement message here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--brand)]"
                  required
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Only the most recent announcement will be displayed to users. Creating a new announcement will deactivate all previous ones.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand)]/90 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setTitle('');
                    setMessage('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-500">Create your first announcement to notify users.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-lg shadow p-6 ${
                  announcement.isActive ? 'border-l-4 border-[var(--brand)]' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      {announcement.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.message}</p>
                    <p className="text-sm text-gray-500">
                      Created on {new Date(announcement.createdAt).toLocaleDateString()} at{' '}
                      {new Date(announcement.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete announcement"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
