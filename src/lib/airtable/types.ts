export interface Product {
    id: string;
    destination: string;
    tourName: string;
    category: string;
    basePrice: number; // For calculations (using Adulto)
    priceAdulto: number;
    priceMenor: number;
    priceBebe: number;
    pickup?: string;
    retorno?: string;
    temporada?: string;
    diasElegiveis?: string[];
    imageUrl?: string;
}

export interface Agency {
    id: string;
    name: string;
    email: string; // Linked to Clerk User Email
    commissionRate: number; // e.g., 0.10 for 10%
}
