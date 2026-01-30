export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white shadow rounded-lg overflow-hidden border border-gray-100 ${className || ''}`}>
            {children}
        </div>
    );
}
