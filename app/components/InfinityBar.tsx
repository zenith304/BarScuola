'use client';

export function InfinityBar() {
    return (
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative border border-gray-300">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-1/3 animate-infinity-scroll rounded-full"></div>
            <style jsx global>{`
                @keyframes infinity-scroll {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(350%); }
                }
                .animate-infinity-scroll {
                    animation: infinity-scroll 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
