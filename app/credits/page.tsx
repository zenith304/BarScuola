'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';

export default function CreditsPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        panini: 0,
        money: 0,
        coffees: 0,
        bugs: 0
    });

    useEffect(() => {
        // Generate random stats on mount to ensure hydration match (or just use fixed randoms)
        setStats({
            panini: Math.floor(Math.random() * 5000) + 100,
            money: Math.floor(Math.random() * 20000) + 500,
            coffees: Math.floor(Math.random() * 1000) + 50,
            bugs: 999
        });

        // Redirect after credits (optional, let's keep it manual for now)
    }, []);

    return (
        <div className="min-h-screen bg-black text-yellow-400 overflow-hidden relative flex flex-col items-center justify-center font-mono">
            <style jsx global>{`
                @keyframes crawl {
                    0% {
                        top: 100%;
                        transform: rotateX(20deg) translateZ(0);
                    }
                    100% {
                        top: -200%;
                        transform: rotateX(25deg) translateZ(-2500px);
                    }
                }
                .star-wars {
                    perspective: 400px;
                    height: 100vh;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    position: relative;
                }
                .crawl {
                    position: relative;
                    top: 100%;
                    transform-origin: 50% 100%;
                    animation: crawl 60s linear infinite;
                    text-align: center;
                    font-size: 2rem;
                    line-height: 1.5;
                    font-weight: bold;
                    width: 90%;
                    max-width: 800px;
                }
                .title {
                    font-size: 4rem;
                    margin-bottom: 2rem;
                    color: #FFE81F; /* Star Wars Yellow */
                }
                .stat-box {
                    margin: 3rem 0;
                }
            `}</style>

            <div className="z-50 absolute top-4 right-4">
                <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-900" onClick={() => router.push('/')}>
                    X
                </Button>
            </div>

            <div className="star-wars">
                <div className="crawl">
                    <div className="title">THE GAME BAR</div>

                    <p>Un tempo, in una scuola lontana lontana...</p>
                    <p>Gli studenti avevano fame.</p>
                    <br />

                    <div className="stat-box">
                        <p>STATISTICHE GLOBALI:</p>
                        <br />
                        <p>PANINI ORDINATI ............... {stats.panini}</p>
                        <p>SOLDI SPESI ................... {stats.money} €</p>
                        <p>CALORIE ASSIMILATE ............... {stats.coffees}</p>
                        <p>BUG CREATI ................... {stats.bugs}+</p>
                    </div>

                    <br />
                    <p>CREDITI</p>
                    <br />
                    <p>Sviluppatore Capo</p>
                    <p className="text-white">LUCA DAL SASSO</p>
                    <br />
                    <p>Assistente AI</p>
                    <p className="text-white">ANTIGRAVITY</p>
                    <br />
                    <p>Design & Concept</p>
                    <p className="text-white">LUCA DAL SASSO</p>
                    <p className="text-white">LUCA ROSSI</p>
                    <p className="text-white">BAR ITIS ROSSI</p>
                    <br />
                    <br />
                    <p>Grazie per aver giocato.</p>
                </div>
            </div>

            <div className="absolute bottom-10 z-50">
                <Button
                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-xl px-8 py-6 animate-pulse"
                    onClick={() => router.push('/')}
                >
                    GIOCA ANCORA
                </Button>
            </div>
        </div>
    );
}
