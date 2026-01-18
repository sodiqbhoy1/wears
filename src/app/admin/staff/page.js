'use client';

import { useEffect, useState } from 'react';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, staffId: null, staffName: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/staff', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      } else {
        const errorData = await res.json();
        alert(`Failed to fetch staff: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      alert(`An error occurred while fetching staff: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffStatus = async (staffId, currentStatus) => {
    setActionLoading(staffId);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          staffId,
          isActive: !currentStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchStaff(); // Refresh list
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to update staff status'}`);
      }
    } catch (error) {
      console.error('Failed to update staff status:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStaff = async () => {
    const { staffId } = deleteModal;
    setActionLoading(staffId);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/staff?id=${staffId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setDeleteModal({ show: false, staffId: null, staffName: '' });
        fetchStaff(); // Refresh list
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to delete staff'}`);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        Inactive
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-600 mt-2">Manage staff accounts and permissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Staff</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{staff.length}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {staff.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {staff.filter(s => !s.isActive).length}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{member.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(member.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleStaffStatus(member._id, member.isActive)}
                          disabled={actionLoading === member._id}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            member.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionLoading === member._id ? (
                            <span className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              <span>...</span>
                            </span>
                          ) : member.isActive ? (
                            'Deactivate'
                          ) : (
                            'Activate'
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ show: true, staffId: member._id, staffName: member.name })}
                          disabled={actionLoading === member._id}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approval Section */}
      {staff.filter(s => !s.isActive).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            Pending Approval ({staff.filter(s => !s.isActive).length})
          </h2>
          <p className="text-gray-600 mb-4">
            The following staff members are waiting for your approval to access the system:
          </p>
          <div className="space-y-3">
            {staff.filter(s => !s.isActive).map((member) => (
              <div key={member._id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {formatDate(member.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => toggleStaffStatus(member._id, member.isActive)}
                  disabled={actionLoading === member._id}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading === member._id ? 'Approving...' : 'Approve'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteModal.staffName}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={deleteStaff}
                disabled={actionLoading === deleteModal.staffId}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {actionLoading === deleteModal.staffId ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, staffId: null, staffName: '' })}
                disabled={actionLoading === deleteModal.staffId}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
