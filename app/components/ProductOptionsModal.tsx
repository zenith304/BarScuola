'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ProductOption {
    id: string;
    name: string;
    choices: string;
    allowMulti: boolean;
}

interface ProductOptionsModalProps {
    productName: string;
    options: ProductOption[];
    onConfirm: (selections: Record<string, string[]>) => void;
    onCancel: () => void;
}

export function ProductOptionsModal({ productName, options, onConfirm, onCancel }: ProductOptionsModalProps) {
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    function toggleChoice(optionName: string, choice: string, allowMulti: boolean) {
        setSelections(prev => {
            const current = prev[optionName] || [];
            if (allowMulti) {
                // Toggle in array
                if (current.includes(choice)) {
                    return { ...prev, [optionName]: current.filter(c => c !== choice) };
                } else {
                    return { ...prev, [optionName]: [...current, choice] };
                }
            } else {
                // Single select
                return { ...prev, [optionName]: [choice] };
            }
        });
    }

    function handleConfirm() {
        // Validate: check if all options have at least one selection
        const missingOptions = options.filter(opt => !selections[opt.name] || selections[opt.name].length === 0);
        if (missingOptions.length > 0) {
            alert(`Seleziona almeno un'opzione per: ${missingOptions.map(o => o.name).join(', ')}`);
            return;
        }
        onConfirm(selections);
    }

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <Card className="max-w-md w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Personalizza: {productName}</h2>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {options.map((option) => {
                    const choicesList = option.choices.split(',').map(c => c.trim());
                    const selected = selections[option.name] || [];

                    return (
                        <div key={option.id} className="mb-6 last:mb-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">
                                {option.name} <span className="text-slate-500 dark:text-slate-400 font-normal normal-case ml-1">{option.allowMulti ? '(puoi selezionare più opzioni)' : '(seleziona una)'}</span>
                            </h3>
                            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                {choicesList.map((choice) => (
                                    <label key={choice} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="relative flex items-center">
                                            <input
                                                type={option.allowMulti ? 'checkbox' : 'radio'}
                                                name={option.name}
                                                checked={selected.includes(choice)}
                                                onChange={() => toggleChoice(option.name, choice, option.allowMulti)}
                                                className="peer appearance-none h-5 w-5 border border-slate-300 dark:border-slate-600 rounded-full checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                style={option.allowMulti ? { borderRadius: '4px' } : {}}
                                            />
                                            <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-[3px] transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="secondary" onClick={onCancel} className="flex-1">Annulla</Button>
                    <Button onClick={handleConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">Aggiungi al Carrello</Button>
                </div>
            </Card>
        </div>,
        document.body
    );
}
