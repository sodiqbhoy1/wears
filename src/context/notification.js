"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const NotificationContext = createContext(null);

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState(new Set());

  const addNotification = useCallback((message, type = 'success', duration = 3500) => {
    // Create a unique key for deduplication
    const dedupeKey = `${message}-${type}`;
    
    // Prevent duplicate notifications within 1 second
    if (recentNotifications.has(dedupeKey)) {
      return null;
    }

    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    // Track recent notifications
    setRecentNotifications(prev => new Set([...prev, dedupeKey]));
    
    // Remove from recent notifications after 1 second
    setTimeout(() => {
      setRecentNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(dedupeKey);
        return newSet;
      });
    }, 1000);
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
    
    return id;
  }, [recentNotifications]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showCartNotification = useCallback((itemName, quantity = 1) => {
    const message = quantity === 1 
      ? `${itemName} added to cart!`
      : `${quantity}x ${itemName} added to cart!`;
    return addNotification(message, 'cart', 3500);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      showCartNotification 
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            '--delay': `${index * 100}ms`
          }}
          className="animate-[slideInRight_0.3s_ease-out_var(--delay)_both]"
        >
          <NotificationItem
            notification={notification}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  const { id, message, type } = notification;

  const getStyles = () => {
    switch (type) {
      case 'cart':
        return 'bg-green-500 text-white border-green-600 shadow-green-500/20';
      case 'success':
        return 'bg-green-500 text-white border-green-600 shadow-green-500/20';
      case 'error':
        return 'bg-red-500 text-white border-red-600 shadow-red-500/20';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-yellow-500/20';
      default:
        return 'bg-blue-500 text-white border-blue-600 shadow-blue-500/20';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <FiCheckCircle className="w-5 h-5 flex-shrink-0" />;
      case 'success':
        return <FiCheckCircle className="w-5 h-5 flex-shrink-0" />;
      case 'error':
        return <FiX className="w-5 h-5 flex-shrink-0" />;
      case 'warning':
        return <FiCheckCircle className="w-5 h-5 flex-shrink-0" />;
      default:
        return <FiCheckCircle className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 pointer-events-auto
      transform transition-all duration-300 ease-out
      backdrop-blur-sm
      ${getStyles()}
      max-w-sm min-w-[280px]
    `}>
      <div className="flex items-center gap-2 flex-1">
        {getIcon()}
        <span className="text-sm font-medium leading-tight">{message}</span>
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Close notification"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export default NotificationContext;