'use client';

import Link from 'next/link';

export function Navbar({ type = 'student' }: { type?: 'student' | 'admin' }) {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href={type === 'admin' ? '/admin/dashboard' : '/'} className="flex-0 flex items-center font-bold text-xl text-blue-600">
                            Bar Scuola
                            {type === 'admin' && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">ADMIN</span>}
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {type === 'student' ? (
                            <>
                                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Menu</Link>
                                <Link href="/cart" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Carrello</Link>
                                <Link href="/orders" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Ordini</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Ordini</Link>
                                <Link href="/admin/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Prodotti</Link>
                                <Link href="/admin/settings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Settings</Link>
                                <form action="/auth/logout" method="post">
                                    {/* Logout action wrapper needed or Client Component calling logout */}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
