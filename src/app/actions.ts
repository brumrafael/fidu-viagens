'use server'

import { currentUser } from '@clerk/nextjs/server';
import { getProducts, getAgencyByEmail } from '@/lib/airtable/service';

export interface AgencyProduct {
    id: string;
    destination: string;
    tourName: string;
    category: string;
    basePrice: number;
    consumerPrice: number; // Final Adulto
    consumerPriceMenor: number;
    consumerPriceBebe: number;
    pickup?: string;
    retorno?: string;
    temporada?: string;
    diasElegiveis?: string[];
    subCategory?: string;
    taxasExtras?: string;
    imageUrl?: string;
}

export async function getAgencyProducts(): Promise<{ products: AgencyProduct[], error?: string }> {
    try {
        const user = await currentUser();

        if (!user) {
            return { products: [], error: 'Unauthorized' };
        }

        // Get Primary Email
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return { products: [], error: 'No email found for this user.' };
        }

        // Fetch Agency Commission
        const agency = await getAgencyByEmail(email);
        const commissionRate = agency ? agency.commissionRate : 0;

        // Fetch Base Products
        const products = await getProducts();

        if (!products || products.length === 0) {
            return { products: [] };
        }

        // Calculate Final Price
        const agencyProducts = products.map(product => {
            const calc = (base: number) => Math.round((base + (base * commissionRate)) * 100) / 100;

            return {
                id: product.id,
                destination: product.destination,
                tourName: product.tourName,
                category: product.category,
                basePrice: product.basePrice,
                consumerPrice: calc(product.priceAdulto),
                consumerPriceMenor: calc(product.priceMenor),
                consumerPriceBebe: calc(product.priceBebe),
                pickup: product.pickup,
                retorno: product.retorno,
                temporada: product.temporada,
                diasElegiveis: product.diasElegiveis,
                subCategory: product.subCategory,
                taxasExtras: product.taxasExtras,
                imageUrl: product.imageUrl
            };
        });

        return { products: agencyProducts };
    } catch (err: any) {
        console.error('Error in getAgencyProducts:', err);
        return {
            products: [],
            error: `Failed to load products: ${err.message || 'Unknown error'}. Check your connection and credentials.`
        };
    }
}
