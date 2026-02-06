import { getAgencyProducts } from '@/app/actions';
import { ProductGrid } from '@/components/ProductGrid';
import { UserButton } from '@clerk/nextjs';

export default async function Portal() {
    const { products, error } = await getAgencyProducts();

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight text-gray-900">
                        Fidu<span className="text-blue-600">Viagens</span> Partner
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton afterSignOutUrl="/sign-in" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarifário de Experiências</h1>
                    <p className="text-gray-500">
                        Tarifas exclusivas para nossos parceiros verificados.
                    </p>
                </div>

                {error ? (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100">
                        {error}
                    </div>
                ) : (
                    <ProductGrid products={products} />
                )}

                {products.length === 0 && !error && (
                    <div className="text-center py-20 text-gray-500">
                        Nenhum passeio encontrado para sua agência.
                    </div>
                )}
            </main>
        </div>
    );
}
