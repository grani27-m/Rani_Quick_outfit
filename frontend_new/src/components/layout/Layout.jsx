import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: 'var(--charcoal)', color: 'white', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 500 },
        success: { style: { background: '#1B5E20' } },
        error: { style: { background: '#B71C1C' } },
      }} />
      <Navbar />
      <main style={{ paddingTop: 70, minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
