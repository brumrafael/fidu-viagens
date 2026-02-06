'use client';

import { AgencyProduct } from '@/app/actions';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Info, Clock, Calendar, CheckCircle2, AlertCircle, ShoppingCart, GripVertical } from 'lucide-react';

interface ProductGridProps {
    products: AgencyProduct[];
}

const DESTINATION_COLORS: Record<string, string> = {
    'SANTIAGO': '#3b5998', // Fidu Blue
    'SAN PEDRO': '#e6af2e', // Deep Yellow/Orange
    'ATACAMA': '#e6af2e',
    'PUERTO NATALES': '#2ea65a', // Green
    'TORRES DEL PAINE': '#2ea65a',
    'CALAMA': '#7f8c8d', // Gray
    'GENERAL': '#34495e',
};

const getDestinationColor = (dest: string) => {
    const key = dest.toUpperCase();
    return DESTINATION_COLORS[key] || '#95a5a6'; // Default silver/gray
};

const COLUMN_KEYS = [
    'type', 'destination', 'service', 'netoAdu', 'saleAdu', 'netoChd', 'netoInf', 'pickup', 'retorno', 'temporada', 'dias'
] as const;

type ColumnKey = typeof COLUMN_KEYS[number];

const INITIAL_WIDTHS: Record<ColumnKey, number> = {
    type: 80,
    destination: 120,
    service: 250,
    netoAdu: 110,
    saleAdu: 110,
    netoChd: 100,
    netoInf: 100,
    pickup: 90,
    retorno: 90,
    temporada: 120,
    dias: 150
};

export function ProductGrid({ products }: ProductGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [destinationFilter, setDestinationFilter] = useState('all');
    const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(INITIAL_WIDTHS);

    // Resizing logic
    const resizingColumn = useRef<{ key: ColumnKey; startX: number; startWidth: number } | null>(null);

    const onMouseDown = useCallback((key: ColumnKey, e: React.MouseEvent) => {
        resizingColumn.current = {
            key,
            startX: e.pageX,
            startWidth: columnWidths[key],
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!resizingColumn.current) return;
            const diff = moveEvent.pageX - resizingColumn.current.startX;
            const newWidth = Math.max(50, resizingColumn.current.startWidth + diff);

            setColumnWidths(prev => ({
                ...prev,
                [resizingColumn.current!.key]: newWidth
            }));
        };

        const onMouseUp = () => {
            resizingColumn.current = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [columnWidths]);

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
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
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
                    <table className="w-full text-left border-collapse table-fixed" style={{ width: 'max-content', minWidth: '100%' }}>
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th style={{ width: columnWidths.type }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Tipo
                                    <div onMouseDown={(e) => onMouseDown('type', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.destination }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Destino
                                    <div onMouseDown={(e) => onMouseDown('destination', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.service }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Serviço
                                    <div onMouseDown={(e) => onMouseDown('service', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.netoAdu }} className="relative px-4 py-3 text-[10px] font-bold text-[#3b5998] uppercase tracking-tight text-right bg-blue-50/30 group/th">
                                    Neto (ADU)
                                    <div onMouseDown={(e) => onMouseDown('netoAdu', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.saleAdu }} className="relative px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-tight text-right group/th">
                                    Venda (ADU)
                                    <div onMouseDown={(e) => onMouseDown('saleAdu', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.netoChd }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right group/th">
                                    Neto (CHD)
                                    <div onMouseDown={(e) => onMouseDown('netoChd', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.netoInf }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight text-right group/th">
                                    Neto (INF)
                                    <div onMouseDown={(e) => onMouseDown('netoInf', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.pickup }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Pickup
                                    <div onMouseDown={(e) => onMouseDown('pickup', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.retorno }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Retorno
                                    <div onMouseDown={(e) => onMouseDown('retorno', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.temporada }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Temporada
                                    <div onMouseDown={(e) => onMouseDown('temporada', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                                <th style={{ width: columnWidths.dias }} className="relative px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight group/th">
                                    Dias
                                    <div onMouseDown={(e) => onMouseDown('dias', e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400 transition-colors bg-gray-200 opacity-0 group-hover/th:opacity-100" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-4 py-4 truncate">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.category === 'REG' ? 'bg-yellow-100 text-yellow-700' :
                                            product.category === 'PVD' ? 'bg-gray-100 text-gray-700' :
                                                'bg-blue-100 text-[#3b5998]'
                                            }`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap overflow-hidden">
                                        <span className="text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm truncate inline-block" style={{ backgroundColor: getDestinationColor(product.destination) }}>
                                            {product.destination}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 overflow-hidden">
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-[#3b5998] truncate" title={product.tourName}>
                                            {product.tourName}
                                        </div>
                                    </td>
                                    <td
                                        className="px-4 py-4 text-right bg-blue-50/10 truncate cursor-help"
                                        title={`Sugestão de Venda: ${formatPrice(product.salePriceAdulto)}`}
                                    >
                                        <span className="text-sm font-bold text-[#3b5998]">
                                            {formatPrice(product.netoPriceAdulto)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right truncate">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatPrice(product.salePriceAdulto)}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-4 text-right truncate cursor-help"
                                        title={`Sugestão de Venda: ${formatPrice(product.salePriceMenor)}`}
                                    >
                                        <span className="text-sm text-gray-600">
                                            {formatPrice(product.netoPriceMenor)}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-4 text-right truncate cursor-help"
                                        title={`Sugestão de Venda: ${formatPrice(product.salePriceBebe)}`}
                                    >
                                        <span className="text-sm text-gray-400">
                                            {formatPrice(product.netoPriceBebe)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 font-mono truncate">
                                        {product.pickup || '--:--'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 font-mono truncate">
                                        {product.retorno || '--:--'}
                                    </td>
                                    <td className="px-4 py-4 truncate">
                                        <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded border border-cyan-100 whitespace-nowrap truncate inline-block">
                                            {product.temporada}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                                            {product.diasElegiveis?.map(dia => (
                                                <span key={dia} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100">
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
