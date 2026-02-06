'use server'

import { currentUser } from '@clerk/nextjs/server';
import { getProducts, getAgencyByEmail } from '@/lib/airtable/service';

export interface AgencyProduct {
    id: string;
    destination: string;
    tourName: string;
    category: string;
    basePrice: number; // Value Neto (Fidu) - Now exposed
    consumerPrice: number; // Calculated Price
    imageUrl?: string;
}

export async function getAgencyProducts(): Promise<{ products: AgencyProduct[], error?: string }> {
    const user = await currentUser();

    if (!user) {
        return { products: [], error: 'Unauthorized' };
    }

    // Get Primary Email
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
        return { products: [], error: 'No email found' };
    }

    // Fetch Agency Commission
    const agency = await getAgencyByEmail(email);
    const commissionRate = agency ? agency.commissionRate : 0; // Default to 0 if not found (or handle as error)

    // Fetch Base Products
    const products = await getProducts();

    // Calculate Final Price
    const agencyProducts = products.map(product => {
        // Logic: Base + (Base * Commission)
        // Example: 100 + (100 * 0.10) = 110
        const finalPrice = product.basePrice + (product.basePrice * commissionRate);

        return {
            id: product.id,
            destination: product.destination,
            tourName: product.tourName,
            category: product.category,
            basePrice: product.basePrice, // Exposed
            consumerPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
            imageUrl: product.imageUrl
        };
    });

    return { products: agencyProducts };
}
