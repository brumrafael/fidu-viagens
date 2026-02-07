import { getAgencyProducts } from '@/app/actions';
import { PortalHeader } from '@/components/PortalHeader';
import { CartProvider } from '@/components/CartContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Portal do Parceiro | Fidu Viagens",
    description: "Gerencie suas reservas e produtos exclusivos.",
    openGraph: {
        title: "Portal do Parceiro | Fidu Viagens",
        description: "Acesso restrito a agências e operadores.",
    }
};

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { agency, hasUnreadMural } = await getAgencyProducts();

    return (
        <CartProvider>
            <div className="min-h-screen bg-gray-50/50">
                <PortalHeader agency={agency} hasUnreadMural={hasUnreadMural} />
                {children}
            </div>
        </CartProvider>
    );
}
