'use client';

import Link from 'next/link';
import { CartCount } from './CartCount';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar({ type = 'student' }: { type?: 'student' | 'admin' }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const router = useRouter();

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 10) {
            router.push('/credits');
            setClickCount(0);
        } else {
            // Reset count if too slow? For now simple accum is fine, or simple timer.
            // Let's just do simple routing for now.
            if (newCount === 1) {
                setTimeout(() => setClickCount(0), 5000); // 5 seconds to click 10 times
            }
            router.push('/');
        }
    };
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 dark:bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex flex-shrink-0 items-center">
                        <Link href={type === 'admin' ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group" onClick={handleLogoClick}>
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
                                B
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hidden sm:block">
                                Bar Scuola
                            </span>
                            {type === 'admin' && (
                                <span className="ml-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                    ADMIN
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-1">
                            {type === 'student' ? (
                                <>
                                    <NavLink href="/">Menu</NavLink>
                                    <NavLink href="/orders">I miei Ordini</NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink href="/admin/dashboard">Dashboard</NavLink>
                                    <NavLink href="/admin/products">Prodotti</NavLink>
                                    <NavLink href="/admin/feedback">Feedback</NavLink>
                                    <NavLink href="/admin/settings">Impostazioni</NavLink>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-200 dark:border-border">
                            {type === 'student' && (
                                <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-foreground">
                                    <span className="sr-only">Carrello</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                    <div className="absolute -top-1 -right-1">
                                        <CartCount />
                                    </div>
                                </Link>
                            )}
                            <ThemeToggle />

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2 rounded-md text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2 shadow-lg">
                    {type === 'student' ? (
                        <>
                            <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Menu</MobileNavLink>
                            <MobileNavLink href="/orders" onClick={() => setIsMobileMenuOpen(false)}>I miei Ordini</MobileNavLink>
                        </>
                    ) : (
                        <>
                            <MobileNavLink href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                            <MobileNavLink href="/admin/products" onClick={() => setIsMobileMenuOpen(false)}>Prodotti</MobileNavLink>
                            <MobileNavLink href="/admin/feedback" onClick={() => setIsMobileMenuOpen(false)}>Feedback</MobileNavLink>
                            <MobileNavLink href="/admin/settings" onClick={() => setIsMobileMenuOpen(false)}>Impostazioni</MobileNavLink>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg transition-all"
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, onClick, children }: { href: string, onClick: () => void, children: React.ReactNode }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
        >
            {children}
        </Link>
    )
}
