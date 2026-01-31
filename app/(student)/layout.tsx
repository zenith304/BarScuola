import { Navbar } from '@/app/components/Navbar';
import { CartProvider } from '@/app/context/CartContext';
import StudentProviders from "./providers";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentProviders>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Navbar type="student" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </StudentProviders>
  );
}
