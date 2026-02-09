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
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Admin Login</h1>

                <form action={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Email
                        </label>
                        <Input
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="email@domain.com"
                            className="text-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Password
                        </label>
                        <Input
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="text-foreground"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </Card>
        </div>
    );
}
