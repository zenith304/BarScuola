'use client';

import { loginAdmin } from '@/app/actions/admin';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react'; // Add useActionState if Next.js 14+ or just standard form submission

export default function AdminLoginPage() {
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        const result = await loginAdmin(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Admin Login</h1>

                <form action={handleSubmit} className="space-y-6">
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        required
                        autoComplete="email"
                        className="text-gray-900"
                        placeholder="[EMAIL_ADDRESS]"
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Password"
                        className="text-gray-900"
                        required
                        autoComplete="current-password"
                    />

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Card>
        </div>
    );
}
