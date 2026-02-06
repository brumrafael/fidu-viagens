'use client';

import { AgencyProduct } from '@/app/actions';
import { ProductCard } from './ProductCard';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ProductGridProps {
    products: AgencyProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [destinationFilter, setDestinationFilter] = useState('all');

    // Extract unique filters
    const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))).sort(), [products]);
    const destinations = useMemo(() => Array.from(new Set(products.map(p => p.destination))).sort(), [products]);

    // Filter logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                (product.tourName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (product.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            const matchesDestination = destinationFilter === 'all' || product.destination === destinationFilter;

            return matchesSearch && matchesCategory && matchesDestination;
        });
    }, [products, searchTerm, categoryFilter, destinationFilter]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Pesquisar passeios ou destinos..."
                        className="pl-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                        <SelectTrigger className="w-full md:w-40 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Destino" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Destinos</SelectItem>
                            {destinations.map(dest => (
                                <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-40 border-gray-200 rounded-lg">
                            <SelectValue placeholder="Serviço" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Serviços</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight w-20">Sta.</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Destino</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Serviço</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Adulto</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Menor</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right">Bebê</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Pickup</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Retorno</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Temporada</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Dias</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.category === 'REG' ? 'bg-yellow-100 text-yellow-700' :
                                            product.category === 'PVD' ? 'bg-gray-100 text-gray-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="bg-blue-600 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                                            {product.destination}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                                            {product.tourName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatPrice(product.consumerPrice)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm text-gray-600">
                                            {formatPrice(product.consumerPriceMenor)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm text-gray-400">
                                            {formatPrice(product.consumerPriceBebe)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                                        {product.pickup || '--:--'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                                        {product.retorno || '--:--'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                                            {product.temporada}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {product.diasElegiveis?.map(dia => (
                                                <span key={dia} className="text-[9px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded border border-pink-100">
                                                    {dia}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-500 bg-gray-50/50">
                        Nenhum passeio encontrado para os filtros selecionados.
                    </div>
                )}
            </div>
        </div>
    );
}

