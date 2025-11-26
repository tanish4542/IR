import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <Header onOpenChat={() => {}} />
      <main className="mx-auto max-w-7xl px-6 md:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


