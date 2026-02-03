'use client';

import { useState } from 'react';
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Personalizza: {productName}</h2>

                {options.map((option) => {
                    const choicesList = option.choices.split(',').map(c => c.trim());
                    const selected = selections[option.name] || [];

                    return (
                        <div key={option.id} className="mb-4">
                            <h3 className="font-medium text-gray-900 mb-2">
                                {option.name} {option.allowMulti ? '(puoi selezionare più opzioni)' : '(seleziona una)'}
                            </h3>
                            <div className="space-y-2">
                                {choicesList.map((choice) => (
                                    <label key={choice} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type={option.allowMulti ? 'checkbox' : 'radio'}
                                            name={option.name}
                                            checked={selected.includes(choice)}
                                            onChange={() => toggleChoice(option.name, choice, option.allowMulti)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-gray-900">{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="flex gap-2 mt-6">
                    <Button variant="secondary" onClick={onCancel} className="flex-1">Annulla</Button>
                    <Button onClick={handleConfirm} className="flex-1">Aggiungi al Carrello</Button>
                </div>
            </Card>
        </div>
    );
}
