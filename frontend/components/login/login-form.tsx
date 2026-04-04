'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const DEMO_USER = process.env.NEXT_PUBLIC_DEMO_USER || 'admin';
const DEMO_PASS = process.env.NEXT_PUBLIC_DEMO_PASS || 'admin123';

export function LoginForm() {
    const router = useRouter();
    const gymName = process.env.NEXT_PUBLIC_GYM_NAME || 'Gym Dashboard';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        if (username === DEMO_USER && password === DEMO_PASS) {
            sessionStorage.setItem('auth', 'true');
            router.push('/');
        } else {
            setError('Usuario o contraseña incorrectos.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            {/* Subtle background accents */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/6 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/4 blur-3xl" />
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 px-8 py-10 space-y-8">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <Image
                            src="/images/gym-logo.png"
                            alt={`Logo ${gymName}`}
                            width={160}
                            height={48}
                            className="h-12 w-auto mix-blend-multiply"
                            priority
                        />
                    </div>

                    {/* Heading */}
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Bienvenido de nuevo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm font-medium text-foreground">
                                Usuario
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Tu usuario"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError('');
                                    }}
                                    className={cn(
                                        'pl-9 h-11 bg-input border-border transition-colors',
                                        'hover:border-primary/40',
                                        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
                                        error && 'border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20'
                                    )}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Contraseña
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Tu contraseña"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    className={cn(
                                        'pl-9 pr-10 h-11 bg-input border-border transition-colors',
                                        'hover:border-primary/40',
                                        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
                                        error && 'border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/20'
                                    )}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5">
                                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            className={cn(
                                'w-full h-11 font-semibold text-sm tracking-wide',
                                'bg-primary text-primary-foreground',
                                'hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-px',
                                'active:translate-y-0',
                                'transition-all duration-200',
                                'disabled:opacity-60 disabled:pointer-events-none'
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                                    Ingresando...
                                </span>
                            ) : (
                                'Ingresar'
                            )}
                        </Button>
                    </form>


                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground/50">
                    &copy; {new Date().getFullYear()} {gymName}. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}