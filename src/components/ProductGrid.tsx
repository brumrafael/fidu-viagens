'use client';

import { AgencyProduct } from '@/app/actions';
import { ProductCard } from './ProductCard';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Info, MapPin, Clock, Calendar, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

interface ProductGridProps {
    products: AgencyProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [destinationFilter, setDestinationFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<AgencyProduct | null>(null);

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
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
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
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight w-20">Tipo</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Destino</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Serviço</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Categoria</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-[#3b5998] uppercase tracking-tight text-right bg-blue-50/30">Neto (ADU)</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-tight text-right">Venda (ADU)</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-tight">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.category === 'REG' ? 'bg-yellow-100 text-yellow-700' :
                                            product.category === 'PVD' ? 'bg-gray-100 text-gray-700' :
                                                'bg-blue-100 text-[#3b5998]'
                                            }`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-white text-[11px] font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#3b5998' }}>
                                            {product.destination}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 min-w-[200px]">
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-[#3b5998]">
                                            {product.tourName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {product.subCategory?.split(',').map(tag => (
                                                <span key={tag} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 whitespace-nowrap">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right bg-blue-50/10">
                                        <span className="text-sm font-bold text-[#3b5998]">
                                            {formatPrice(product.netoPriceAdulto)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatPrice(product.salePriceAdulto)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="text-[10px] font-bold text-[#3b5998] hover:underline uppercase tracking-wider"
                                        >
                                            Ver Detalhes
                                        </button>
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

            {/* Product Detail Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
                    {selectedProduct && (
                        <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-white">
                            {/* Left: Image & Quick Stats */}
                            <div className="md:col-span-5 relative bg-gray-900 min-h-[300px]">
                                {selectedProduct.imageUrl ? (
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.tourName}
                                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <MapPin className="h-12 w-12 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                                    <span className="inline-flex mb-2 px-3 py-1 rounded-full bg-[#3b5998] text-white text-[10px] font-bold uppercase tracking-wider w-fit">
                                        {selectedProduct.destination}
                                    </span>
                                    <h2 className="text-2xl font-bold text-white leading-tight">
                                        {selectedProduct.tourName}
                                    </h2>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedProduct.subCategory?.split(',').map(tag => (
                                            <span key={tag} className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/30">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Content */}
                            <div className="md:col-span-7 flex flex-col">
                                <div className="p-8 space-y-8">
                                    {/* Description */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                            <Info className="h-3 w-3" /> Sobre o Passeio
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                            {selectedProduct.description || "Nenhuma descrição disponível para este serviço no momento."}
                                        </p>
                                    </section>

                                    {/* Logistics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pickup</span>
                                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                                <Clock className="h-4 w-4 text-[#3b5998]" /> {selectedProduct.pickup || '--:--'}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Temporada</span>
                                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                                <Calendar className="h-4 w-4 text-[#3b5998]" /> {selectedProduct.temporada || 'Ano todo'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nested Pricing Matrix */}
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                            <ShoppingCart className="h-3 w-3" /> Tabela de Valores
                                        </h3>
                                        <div className="overflow-hidden rounded-xl border border-gray-200">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-[10px] text-gray-500 font-bold uppercase">Categoria</th>
                                                        <th className="px-4 py-2 text-right text-[10px] text-[#3b5998] font-bold uppercase">Neto</th>
                                                        <th className="px-4 py-2 text-right text-[10px] text-gray-500 font-bold uppercase">Venda</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr>
                                                        <td className="px-4 py-2 font-medium text-gray-900 italic">Adulto</td>
                                                        <td className="px-4 py-2 text-right font-bold text-[#3b5998]">{formatPrice(selectedProduct.netoPriceAdulto)}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{formatPrice(selectedProduct.salePriceAdulto)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-medium text-gray-900 italic">Menor (CHD)</td>
                                                        <td className="px-4 py-2 text-right font-bold text-[#3b5998]">{formatPrice(selectedProduct.netoPriceMenor)}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{formatPrice(selectedProduct.salePriceMenor)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-2 font-medium text-gray-900 italic">Bebê (INF)</td>
                                                        <td className="px-4 py-2 text-right font-bold text-[#3b5998]">{formatPrice(selectedProduct.netoPriceBebe)}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{formatPrice(selectedProduct.salePriceBebe)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* Inclusions & Requirements */}
                                    <div className="space-y-6">
                                        {selectedProduct.inclusions && (
                                            <section>
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#3b5998] mb-3 flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3" /> Incluso
                                                </h3>
                                                <p className="text-gray-600 text-[13px] leading-relaxed pl-5 border-l-2 border-green-200">
                                                    {selectedProduct.inclusions}
                                                </p>
                                            </section>
                                        )}
                                        {selectedProduct.requirements && (
                                            <section>
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-3 flex items-center gap-2">
                                                    <AlertCircle className="h-3 w-3" /> Requisitos / Recomendações
                                                </h3>
                                                <p className="text-gray-600 text-[13px] leading-relaxed pl-5 border-l-2 border-orange-200 bg-orange-50/30 p-2 rounded-r-lg">
                                                    {selectedProduct.requirements}
                                                </p>
                                            </section>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

