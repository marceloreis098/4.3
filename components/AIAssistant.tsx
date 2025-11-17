import React, { useState, useEffect } from 'react';
import { generateReportWithGemini } from '../services/geminiService';
import { getEquipment } from '../services/apiService';
import { Equipment, User } from '../types';
import Icon from './common/Icon';

const AIAssistant: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<Equipment[] | null>(null);
    const [error, setError] = useState('');
    const [inventoryData, setInventoryData] = useState<Equipment[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        const loadInventory = async () => {
            setIsDataLoading(true);
            try {
                // FIX: Pass the currentUser object to the getEquipment function as required by its signature.
                const data = await getEquipment(currentUser);
                setInventoryData(data);
            } catch (error) {
                console.error("Failed to load inventory for AI assistant", error);
                setError("Não foi possível carregar os dados do inventário para o assistente.");
            } finally {
                setIsDataLoading(false);
            }
        };
        loadInventory();
    }, [currentUser]);


    const handleGenerateReport = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setReport(null);
        try {
            const result = await generateReportWithGemini(query, inventoryData);

            if (result.error) {
                setError(result.error);
            } else if (result.reportData) {
                setReport(result.reportData);
            } else {
                setError('A resposta da IA não continha dados de relatório válidos.');
            }
        } catch (e) {
            console.error(e);
            setError('Falha ao processar a resposta da IA.');
        } finally {
            setIsLoading(false);
        }
    };

    const exampleQueries = [
        "Liste todos os equipamentos do setor FINANCEIRO com garantia expirada.",
        "Mostre todos os notebooks da marca Dell.",
        "Quais equipamentos foram comprados em 2023?",
        "Encontre todos os servidores em manutenção.",
    ];

    return (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary mb-4">Assistente de IA para Relatórios</h2>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
                Use linguagem natural para gerar relatórios complexos do seu inventário. O assistente usará a IA do Gemini para filtrar e apresentar os dados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: 'Liste todos os monitores do setor de TI'"
                    className="flex-grow p-3 border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text-primary"
                    disabled={isLoading || isDataLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
                />
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading || isDataLoading}
                    className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
