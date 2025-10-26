"use client";
import { useEffect, useState } from 'react';
import { FiBell, FiX } from 'react-icons/fi';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        if (data.ok && data.announcement) {
          setAnnouncement(data.announcement);
          
          // Check if user has seen this announcement in this session
          const seenInSession = sessionStorage.getItem('announcement_seen_in_session');
          if (!seenInSession) {
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error('Failed to load announcement:', err);
      }
    };

    loadAnnouncement();
  }, []);

  const handleDismiss = () => {
    // Mark as seen for this session only
    sessionStorage.setItem('announcement_seen_in_session', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !announcement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close announcement"
        >
          <FiX className="w-6 h-6 text-gray-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-full flex items-center justify-center">
            <FiBell className="w-8 h-8 text-[var(--brand)]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
          {announcement.title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center leading-relaxed mb-6">
          {announcement.message}
        </p>

        {/* Action Button */}
        <button
          onClick={handleDismiss}
          className="w-full bg-[var(--brand)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--brand)]/90 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
