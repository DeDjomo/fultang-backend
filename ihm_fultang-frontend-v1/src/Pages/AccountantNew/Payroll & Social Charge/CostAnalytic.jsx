import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, AlertCircle, Award } from 'lucide-react';
import {FinancialAccountantNavLink} from "../NavLink.js";
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";

export function HRAnalyticsDashboard() {
    // Données simulées pour l'analyse RH
    const [timeRange, setTimeRange] = useState('12months');

    // Données historiques de masse salariale (simulées)
    const masseSalarialeHistory = [
        { mois: '2024-07', masseSalariale: 42000000, effectif: 82, chargesSociales: 6720000 },
        { mois: '2024-08', masseSalariale: 42500000, effectif: 83, chargesSociales: 6800000 },
        { mois: '2024-09', masseSalariale: 43200000, effectif: 84, chargesSociales: 6912000 },
        { mois: '2024-10', masseSalariale: 43800000, effectif: 85, chargesSociales: 7008000 },
        { mois: '2024-11', masseSalariale: 44200000, effectif: 86, chargesSociales: 7072000 },
        { mois: '2024-12', masseSalariale: 44500000, effectif: 86, chargesSociales: 7120000 },
        { mois: '2025-01', masseSalariale: 44800000, effectif: 87, chargesSociales: 7168000 },
        { mois: '2025-02', masseSalariale: 44900000, effectif: 87, chargesSociales: 7184000 },
        { mois: '2025-03', masseSalariale: 45200000, effectif: 87, chargesSociales: 7232000 },
        { mois: '2025-04', masseSalariale: 45400000, effectif: 88, chargesSociales: 7264000 },
        { mois: '2025-05', masseSalariale: 45600000, effectif: 88, chargesSociales: 7296000 },
        { mois: '2025-06', masseSalariale: 45000000, effectif: 87, chargesSociales: 7200000 }
    ];

    // Répartition par département
    const departmentBreakdown = [
        { department: 'Production', effectif: 35, masseSalariale: 18200000, couleur: '#3B82F6' },
        { department: 'Commercial', effectif: 18, masseSalariale: 12600000, couleur: '#10B981' },
        { department: 'Administration', effectif: 12, masseSalariale: 8400000, couleur: '#F59E0B' },
        { department: 'IT', effectif: 8, masseSalariale: 5800000, couleur: '#8B5CF6' },
        { department: 'RH', effectif: 6, masseSalariale: 3600000, couleur: '#EF4444' },
        { department: 'Finance', effectif: 8, masseSalariale: 4800000, couleur: '#06B6D4' }
    ];

    // Benchmarks sectoriels (données du marché camerounais)
    const sectorBenchmarks = {
        salaireMoyenSecteur: 580000, // FCFA par mois
        chargesSocialesSecteur: 16.8, // % de la masse salariale
        turnoverSecteur: 12.5, // % annuel
        productiviteSecteur: 520000 // FCFA de CA par salarié par mois
    };

    // Calculs des métriques clés
    const currentMonth = masseSalarialeHistory[masseSalarialeHistory.length - 1];
    const previousMonth = masseSalarialeHistory[masseSalarialeHistory.length - 2];

    const metrics = useMemo(() => {
        const salaireMoyenActuel = currentMonth.masseSalariale / currentMonth.effectif;
        const coutTotalParSalarie = (currentMonth.masseSalariale + currentMonth.chargesSociales) / currentMonth.effectif;
        const tauxChargesSociales = (currentMonth.chargesSociales / currentMonth.masseSalariale) * 100;

        // Évolutions mensuelles
        const evolutionMasseSalariale = ((currentMonth.masseSalariale - previousMonth.masseSalariale) / previousMonth.masseSalariale) * 100;
        const evolutionEffectif = currentMonth.effectif - previousMonth.effectif;

        // Comparaisons avec les benchmarks sectoriels
        const ecartSalaireMoyen = ((salaireMoyenActuel - sectorBenchmarks.salaireMoyenSecteur) / sectorBenchmarks.salaireMoyenSecteur) * 100;
        const ecartChargesSociales = tauxChargesSociales - sectorBenchmarks.chargesSocialesSecteur;

        return {
            salaireMoyenActuel,
            coutTotalParSalarie,
            tauxChargesSociales,
            evolutionMasseSalariale,
            evolutionEffectif,
            ecartSalaireMoyen,
            ecartChargesSociales
        };
    }, [currentMonth, previousMonth]);

    // Fonction de formatage des montants
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount).replace('XAF', 'FCFA');
    };

    // Fonction de formatage des pourcentages
    const formatPercentage = (value, decimals = 1) => {
        return `${value.toFixed(decimals)}%`;
    };

    // Préparation des données pour les graphiques
    const chartData = masseSalarialeHistory.map(item => ({
        ...item,
        moisLabel: new Date(item.mois).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        salaireMoyen: item.masseSalariale / item.effectif,
        coutTotal: item.masseSalariale + item.chargesSociales
    }));

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar></AccountantNavBar>
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* En-tête du tableau de bord */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <BarChart className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analyses RH</h1>
                            <p className="text-gray-600">Coûts, évolutions et benchmarks sectoriels</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="6months">6 derniers mois</option>
                            <option value="12months">12 derniers mois</option>
                            <option value="24months">24 derniers mois</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Salaire moyen</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.salaireMoyenActuel)}</p>
                            <div className="flex items-center mt-1">
                                {metrics.ecartSalaireMoyen >= 0 ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                                )}
                                <span className={`text-sm ${metrics.ecartSalaireMoyen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(Math.abs(metrics.ecartSalaireMoyen))} vs secteur
                </span>
                            </div>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Coût total par ETP</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.coutTotalParSalarie)}</p>
                            <p className="text-sm text-gray-500">Charges sociales incluses</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux charges sociales</p>
                            <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.tauxChargesSociales)}</p>
                            <div className="flex items-center mt-1">
                <span className={`text-sm ${metrics.ecartChargesSociales <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.ecartChargesSociales > 0 ? '+' : ''}{formatPercentage(metrics.ecartChargesSociales)} vs secteur
                </span>
                            </div>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Évolution effectif</p>
                            <p className="text-2xl font-bold text-gray-900">{currentMonth.effectif}</p>
                            <div className="flex items-center mt-1">
                                {metrics.evolutionEffectif >= 0 ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                                )}
                                <span className={`text-sm ${metrics.evolutionEffectif >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.evolutionEffectif >= 0 ? '+' : ''}{metrics.evolutionEffectif} ce mois
                </span>
                            </div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-indigo-600" />
                    </div>
                </div>
            </div>

            {/* Graphiques d'évolution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Évolution masse salariale et effectif */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Évolution Masse Salariale & Effectif</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="moisLabel" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'masseSalariale' ? formatCurrency(value) : value,
                                    name === 'masseSalariale' ? 'Masse salariale' : 'Effectif'
                                ]}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="masseSalariale" stroke="#3B82F6" strokeWidth={2} name="masseSalariale" />
                            <Line yAxisId="right" type="monotone" dataKey="effectif" stroke="#10B981" strokeWidth={2} name="effectif" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Évolution coût total par salarié */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Coût Total par Salarié (ETP)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="moisLabel" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="salaireMoyen" fill="#8B5CF6" name="Salaire moyen" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par département */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Graphique en secteurs - Répartition effectif */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Répartition Effectif par Département</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={departmentBreakdown}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="effectif"
                                label={({ department, effectif }) => `${department}: ${effectif}`}
                            >
                                {departmentBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.couleur} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tableau détaillé par département */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Analyse par Département</h3>
                    <div className="space-y-3">
                        {departmentBreakdown.map((dept, index) => {
                            const salaireMoyenDept = dept.masseSalariale / dept.effectif;
                            const pourcentageEffectif = (dept.effectif / currentMonth.effectif) * 100;

                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: dept.couleur }}
                                            ></div>
                                            <span className="font-medium">{dept.department}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                      {formatPercentage(pourcentageEffectif, 0)} de l'effectif
                    </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Effectif</p>
                                            <p className="font-semibold">{dept.effectif} personnes</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Masse salariale</p>
                                            <p className="font-semibold">{formatCurrency(dept.masseSalariale)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Salaire moyen</p>
                                            <p className="font-semibold">{formatCurrency(salaireMoyenDept)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Benchmarks sectoriels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Benchmarks Sectoriels (Cameroun)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Salaire moyen secteur</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(sectorBenchmarks.salaireMoyenSecteur)}</p>
                            <p className="text-sm text-gray-500 mt-1">Notre position:</p>
                            <p className={`text-sm font-medium ${metrics.ecartSalaireMoyen >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metrics.ecartSalaireMoyen >= 0 ? 'Au-dessus' : 'En-dessous'} ({formatPercentage(Math.abs(metrics.ecartSalaireMoyen))})
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Charges sociales secteur</p>
                            <p className="text-xl font-bold text-purple-600">{formatPercentage(sectorBenchmarks.chargesSocialesSecteur)}</p>
                            <p className="text-sm text-gray-500 mt-1">Notre taux:</p>
                            <p className={`text-sm font-medium ${metrics.ecartChargesSociales <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(metrics.tauxChargesSociales)} ({metrics.ecartChargesSociales > 0 ? '+' : ''}{formatPercentage(metrics.ecartChargesSociales)})
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Turnover secteur</p>
                            <p className="text-xl font-bold text-green-600">{formatPercentage(sectorBenchmarks.turnoverSecteur)}</p>
                            <p className="text-sm text-gray-500 mt-1">À surveiller</p>
                            <p className="text-sm text-gray-600">Données à collecter</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600">Productivité secteur</p>
                            <p className="text-xl font-bold text-yellow-600">{formatCurrency(sectorBenchmarks.productiviteSecteur)}</p>
                            <p className="text-sm text-gray-500 mt-1">CA par salarié/mois</p>
                            <p className="text-sm text-gray-600">Objectif cible</p>
                        </div>
                    </div>
                </div>

                {/* Recommandations basées sur les benchmarks */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-gray-900">Recommandations Stratégiques</h4>
                            <ul className="mt-2 text-sm text-gray-600 space-y-1">
                                {metrics.ecartSalaireMoyen > 10 && (
                                    <li>• Salaires supérieurs au marché (+{formatPercentage(metrics.ecartSalaireMoyen)}) - Vérifier la pertinence des grilles salariales</li>
                                )}
                                {metrics.ecartSalaireMoyen < -10 && (
                                    <li>• Salaires inférieurs au marché ({formatPercentage(metrics.ecartSalaireMoyen)}) - Risque de turnover élevé</li>
                                )}
                                {metrics.tauxChargesSociales > sectorBenchmarks.chargesSocialesSecteur + 2 && (
                                    <li>• Taux de charges sociales élevé - Optimiser la structure de rémunération</li>
                                )}
                                <li>• Effectif stable avec {currentMonth.effectif} collaborateurs - Maintenir la dynamique de croissance</li>
                                <li>• Suivi mensuel recommandé pour anticiper les écarts budgétaires</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            </AccountantDashBoard>
    );
};

