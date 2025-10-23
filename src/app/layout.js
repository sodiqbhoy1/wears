
import "./globals.css";
import { CartProvider } from '@/context/cart';
import { NotificationProvider } from '@/context/notification';

export const metadata = {
  title: "Food Joint",
  description: "Your spot to enjoy",
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
