'use client';

import { useState, useMemo } from 'react';
import { AgencyProduct, Reservation } from '@/lib/airtable/types';
import { AgencyInfo, createReservationAction } from '@/app/actions';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, MessageCircle, Calendar, User, CheckCircle2, Copy, Loader2, ArrowRight } from 'lucide-react';

interface SalesSimulatorProps {
    product: AgencyProduct | null;
    isOpen: boolean;
    onClose: () => void;
    agencyInfo?: AgencyInfo;
}

export function SalesSimulator({ product, isOpen, onClose, agencyInfo }: SalesSimulatorProps) {
    const [step, setStep] = useState<'simulate' | 'reserve'>('simulate');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    // Reservation fields
    const [clientName, setClientName] = useState('');
    const [tourDate, setTourDate] = useState('');
    const [paxNames, setPaxNames] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const commissionRate = agencyInfo?.commissionRate || 0;

    const totals = useMemo(() => {
        if (!product) return { total: 0, commission: 0 };

        const total = (adults * product.salePriceAdulto) +
            (children * product.salePriceMenor) +
            (infants * product.salePriceBebe);

        const commission = total * commissionRate;

        return { total, commission };
    }, [product, adults, children, infants, commissionRate]);

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleCopySummary = () => {
        if (!product) return;

        const summary = `*Resumo da Experiência - Fidu Viagens*\n\n` +
            `*Passeio:* ${product.tourName}\n` +
            `*Destino:* ${product.destination}\n` +
            `*Passageiros:* ${adults} Adulto(s)${children > 0 ? `, ${children} Criança(s)` : ''}${infants > 0 ? `, ${infants} Bebê(s)` : ''}\n\n` +
            `*Valor Total:* ${formatPrice(totals.total)}\n\n` +
            `_Reservas sujeitas a disponibilidade._`;

        navigator.clipboard.writeText(summary);
        alert('Resumo copiado para o WhatsApp!');
    };

    const handleCreateReservation = async () => {
        if (!product || !clientName || !tourDate) {
            alert('Preencha os campos obrigatórios (Nome e Data)');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createReservationAction({
                productName: product.tourName,
                destination: product.destination,
                date: tourDate,
                adults,
                children,
                infants,
                paxNames: `${clientName}${paxNames ? `\n\nOutros: ${paxNames}` : ''}`,
                totalAmount: totals.total,
                commissionAmount: totals.commission
            });

            if (result.success) {
                alert('Pré-reserva enviada com sucesso!');
                onClose();
            } else {
                alert(result.error || 'Erro ao criar reserva');
            }
        } catch (error) {
            alert('Falha na comunicação com o servidor');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-[#3b5998] flex items-center gap-2">
                        {step === 'simulate' ? <Calculator className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                        {step === 'simulate' ? 'Simulador de Venda' : 'Finalizar Pré-reserva'}
                    </SheetTitle>
                    <SheetDescription>
                        {product.destination} - {product.tourName}
                    </SheetDescription>
                </SheetHeader>

                {step === 'simulate' ? (
                    <div className="space-y-6">
                        {/* PAX Selectors */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Adultos</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={adults}
                                    onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                                    className="border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Crianças</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={children}
                                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                                    className="border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bebês</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={infants}
                                    onChange={(e) => setInfants(parseInt(e.target.value) || 0)}
                                    className="border-gray-200"
                                />
                            </div>
                        </div>

                        {/* Calculation Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Valor Total (Cliente)</span>
                                <span className="text-xl font-bold text-gray-900">{formatPrice(totals.total)}</span>
                            </div>

                            {!agencyInfo?.isInternal && (
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Sua Comissão</span>
                                        <span className="text-blue-600 text-[10px] font-medium">Base: {(commissionRate * 100).toFixed(0)}%</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">{formatPrice(totals.commission)}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                variant="outline"
                                className="w-full h-12 gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
                                onClick={handleCopySummary}
                            >
                                <Copy className="h-4 w-4" />
                                Copiar para WhatsApp
                            </Button>

                            {agencyInfo?.canReserve && (
                                <Button
                                    className="w-full h-12 gap-2 bg-[#3b5998] hover:bg-[#2d4373]"
                                    onClick={() => setStep('reserve')}
                                >
                                    Prosseguir para Reserva
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
                            <p className="text-xs text-blue-700 font-medium">
                                Resumo: {adults} ADU, {children} CHD, {infants} INF | Total: {formatPrice(totals.total)}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase">Nome do Cliente Principal *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Ex: João da Silva"
                                        className="pl-10 h-12"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase">Data da Experiência *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        className="pl-10 h-12"
                                        value={tourDate}
                                        onChange={(e) => setTourDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 uppercase">Outros Passageiros / Observações</Label>
                                <Textarea
                                    placeholder="Nomes dos demais passageiros ou detalhes específicos..."
                                    className="min-h-[100px]"
                                    value={paxNames}
                                    onChange={(e) => setPaxNames(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-6">
                            <Button
                                className="w-full h-14 text-white font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                                onClick={handleCreateReservation}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                )}
                                Confirmar Pré-reserva
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-gray-500"
                                onClick={() => setStep('simulate')}
                                disabled={isSubmitting}
                            >
                                Voltar para o Simulador
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
