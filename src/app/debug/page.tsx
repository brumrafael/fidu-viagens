import { getAirtableBase } from '@/lib/airtable/client';

export default async function DebugPage() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    const base = getAirtableBase();

    return (
        <div className="p-10 font-sans">
            <h1 className="text-2xl font-bold mb-6">Diagnóstico de Ambiente (Production)</h1>

            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="font-semibold">Clerk Publishable Key</h2>
                    <p>Status: {clerkKey ? '✅ Carregada' : '❌ Faltando'}</p>
                    {clerkKey && <p className="text-xs text-gray-400">Inicia com: {clerkKey.substring(0, 8)}...</p>}
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold">Airtable API Key</h2>
                    <p>Status: {apiKey ? '✅ Carregada' : '❌ Faltando'}</p>
                    {apiKey && <p className="text-xs text-gray-400">Inicia com: {apiKey.substring(0, 4)}... (Tamanho: {apiKey.length})</p>}
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold">Airtable Base ID</h2>
                    <p>Status: {baseId ? '✅ Carregada' : '❌ Faltando'}</p>
                    {baseId && <p className="text-xs text-gray-400">ID: {baseId.substring(0, 4)}...</p>}
                </div>

                <div className="p-4 border rounded">
                    <h2 className="font-semibold">Client Airtable</h2>
                    <p>Status: {base ? '✅ Inicializado' : '❌ Falhou na inicialização'}</p>
                </div>
            </div>

            <p className="mt-8 text-sm text-gray-400 italic">
                Nota: Esta página é apenas para diagnóstico temporário.
            </p>
        </div>
    );
}
