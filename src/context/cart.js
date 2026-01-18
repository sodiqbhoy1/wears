"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './notification';

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const notification = useNotification();
  const showCartNotification = notification?.showCartNotification;

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wearhouse_cart');
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch (e) {
      // ignore parse errors
      console.warn('Failed to load cart from localStorage', e);
    }
  }, []);

  // Persist cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('wearhouse_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const add = (product) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item._id === product._id &&
          item.size === product.size &&
          item.color === product.color
      );

      if (existingItem) {
        return prev.map((item) =>
          item._id === product._id &&
          item.size === product.size &&
          item.color === product.color
            ? { ...item, qty: item.qty + product.quantity }
            : item
        );
      } else {
        return [...prev, { ...product, qty: product.quantity }];
      }
    });

    if (showCartNotification) {
      showCartNotification(product.name, product.quantity);
    }
  };

  const update = (key, qty) => {
    setItems((prev) => {
      return prev.map((item, index) => {
        if (index.toString() === key) {
          return { ...item, qty };
        }
        return item;
      });
    });
  };
  
  const remove = (key) => {
    setItems((prev) => prev.filter((_, index) => index.toString() !== key));
  };
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
