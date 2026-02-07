'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingFeedbackButton() {
    const pathname = usePathname();

    // Don't show on feedback pages or admin pages
    if (pathname.startsWith('/feedback') || pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <Link
            href="/feedback"
            className="fixed bottom-6 left-6 z-50 bg-white text-gray-700 shadow-lg rounded-full px-4 py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-200 group"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg>
            <span className="font-medium text-sm hidden group-hover:inline-block whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-xs">
                Feedback
            </span>
        </Link>
    );
}
