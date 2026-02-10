
import { Navbar } from '@/app/components/Navbar';
import { Analytics } from "@vercel/analytics/next"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar type="admin" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Analytics />
        </div>
    );
}
