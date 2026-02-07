import { getProductBase, getAgencyBase } from './client';
import { Product, Agency, MuralItem, MuralReadLog } from './types';
import { FieldSet } from 'airtable';

// Helper to map record to Product
const mapToProduct = (record: any): Product => {
    const fields = record.fields;

    // Duration formatting helper (Airtable returns seconds)
    const formatDuration = (seconds?: number) => {
        if (typeof seconds !== 'number') return undefined;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return {
        id: record.id,
        destination: fields['Destino'] as string || 'General',
        tourName: fields['Serviço'] as string || 'Unnamed Tour',
        category: fields['Categoria do Serviço'] as string || 'Other',
        subCategory: Array.isArray(fields['Categoria']) ? fields['Categoria'].join(', ') : fields['Categoria'] as string,
        taxasExtras: fields['Taxas Extras?'] as string,
        basePrice: fields['INV26 ADU'] as number || 0,
        priceAdulto: fields['INV26 ADU'] as number || 0,
        priceMenor: fields['INV26 CHD'] as number || 0,
        priceBebe: fields['INV26 INF'] as number || 0,
        pickup: formatDuration(fields['Pickup']),
        retorno: formatDuration(fields['Retorno']),
        temporada: Array.isArray(fields['Temporada']) ? fields['Temporada'].join(', ') : fields['Temporada'] as string,
        diasElegiveis: fields['Dias elegíveis'] as string[],
        description: fields['Descrição'] as string,
        inclusions: fields['Incluso'] as string,
        exclusions: fields['Não Incluso'] as string,
        requirements: fields['Requisitos'] as string,
        imageUrl: fields['Mídia do Passeio']?.[0]?.url,
    };
};

export const getProducts = async (): Promise<Product[]> => {
    const base = getProductBase();
    if (!base) {
        console.error('Airtable product base not initialized.');
        return [];
    }

    try {
        // Using 'Passeios' table which contains the detailed tarifário
        const records = await base('Passeios').select().all();
        return records.map(mapToProduct);
    } catch (err) {
        console.error('Error fetching from Passeios, trying fallback Products:', err);
        try {
            const records = await base('Products').select().all();
            return records.map(mapToProduct);
        } catch (innerErr) {
            console.error('Total failure fetching products:', innerErr);
            return [];
        }
    }
};

export const getAgencyByEmail = async (email: string): Promise<Agency | null> => {
    const base = getAgencyBase();
    if (!base) {
        console.error('Airtable Agency base not initialized. Check AIRTABLE_AGENCY_BASE_ID.');
        return null;
    }

    const records = await base('tblkVI2PX3jPgYKXF').select({
        filterByFormula: `{mail} = '${email}'`,
        maxRecords: 1
    }).all();

    if (records.length === 0) return null;

    const record = records[0];
    return {
        id: record.id,
        name: record.fields['Agency'] as string || record.fields['Name'] as string,
        email: record.fields['mail'] as string,
        commissionRate: record.fields['Comision_base'] as number || 0,
        skills: record.fields['Skill'] as string[] || [],
        canReserve: record.fields['Reserva'] as boolean || false,
        isInternal: record.fields['Interno'] as boolean || false,
    };
};

export const createAgency = async (agency: Omit<Agency, 'id'>) => {
    const base = getAgencyBase();
    if (!base) {
        throw new Error('Airtable Agency base not initialized');
    }

    await base('tblkVI2PX3jPgYKXF').create([
        {
            fields: {
                'Agency': agency.name,
                'mail': agency.email,
                'Comision_base': agency.commissionRate
            }
        }
    ]);
};

export async function getMuralItems(userEmail?: string, userName?: string): Promise<MuralItem[]> {
    const base = getProductBase();
    if (!base) return [];

    let records;
    try {
        // Try '◉ No ar!' first as requested by user previously
        records = await base('◉ No ar!').select({
            sort: [{ field: 'Data', direction: 'desc' }]
        }).all();
    } catch (e) {
        console.warn("'◉ No ar!' table not found or error, trying 'Mural' table...", e);
        try {
            // Fallback to 'Mural' table which is visible in the screenshot
            records = await base('Mural').select({
                sort: [{ field: 'Data', direction: 'desc' }]
            }).all();
        } catch (e2: any) {
            // Try Mural without specific sort if 'Data' field is also missing
            try {
                records = await base('Mural').select().all();
            } catch (e3: any) {
                throw new Error(`Tabela de Mural não encontrada. Verifique se existe a aba 'Mural' ou '◉ No ar!' no Airtable. Erro: ${e2.message}`);
            }
        }
    }

    return records.map((record: any) => {
        const fields = record.fields;

        // Use 'Select' field for IsNew if 'IsNew' is missing, matching screenshot
        const isNew = fields['Select'] === 'Novo!' || fields['IsNew'] === true;

        // Flexible field mapping based on common names and screenshot
        const title = fields['Título'] || fields['Aviso'] || fields['Title'] || 'Sem título';
        const details = fields['Notes'] || fields['Detalhes'] || fields['Details'] || '';
        const date = fields['Data'] || fields['Date'] || new Date().toISOString();
        const category = fields['Categoria'] || fields['Category'] || 'Geral';

        // Check if read by current user
        const lidoField = fields['Lido'] as any[] || [];
        const isRead = lidoField.some(reader => {
            if (typeof reader === 'string') {
                return reader === userName || reader === userEmail;
            }
            if (typeof reader === 'object' && reader.email) {
                return reader.email === userEmail;
            }
            return false;
        });

        return {
            id: record.id,
            date: date as string,
            category: category as string,
            title: title as string,
            details: details as string,
            isNew: !!isNew,
            isRead: !!isRead
        };
    });
}

export async function markAsRead(muralId: string, userEmail: string, userName: string, agencyId: string): Promise<void> {
    const base = getProductBase();
    if (!base) return;

    // 1. Try to record in MuralReadLog (detailed log)
    try {
        await base('MuralReadLog').create([
            {
                fields: {
                    'Mural': [muralId],
                    'UserEmail': userEmail,
                    'UserName': userName,
                    'AgencyId': agencyId,
                    'Timestamp': new Date().toISOString()
                }
            }
        ]);
    } catch (e) {
        console.warn('MuralReadLog table may be missing or inaccessible:', e);
    }

    // 2. Update the "Lido" field in '◉ No ar!' or 'Mural' table
    const tablesToTry = ['◉ No ar!', 'Mural'];

    for (const tableName of tablesToTry) {
        try {
            const record = await base(tableName).find(muralId);
            if (!record) continue;

            const fields = record.fields;
            const currentLido = fields['Lido'] as any[] || [];

            // Check if it looks like a collaborator field (objects with id/email) or simple list
            const isCollaboratorField = currentLido.length > 0 && typeof currentLido[0] === 'object';

            let newValue;
            if (isCollaboratorField) {
                // Add as collaborator object
                const alreadyExists = currentLido.some(c => c.email === userEmail || c.name === userName);
                if (!alreadyExists) {
                    newValue = [...currentLido, { email: userEmail }];
                }
            } else {
                // Add as simple string/select/multiselect
                // We compare against both email and name for safety
                const alreadyExists = currentLido.some(c =>
                    typeof c === 'string' && (c.toLowerCase() === userName.toLowerCase() || c.toLowerCase() === userEmail.toLowerCase())
                );
                if (!alreadyExists) {
                    newValue = [...currentLido, userName];
                }
            }

            if (newValue) {
                await base(tableName).update(muralId, {
                    'Lido': newValue
                });
                console.log(`Successfully updated Lido field in ${tableName}`);
            }
            // If we found the record and processed it (or skipped because already read), we stop
            return;
        } catch (e) {
            // Silently try next table
            continue;
        }
    }
}

export async function getMuralReaders(muralId: string, agencyId?: string): Promise<{ userName: string, timestamp: string }[]> {
    const base = getProductBase();
    if (!base) return [];
    let filter = `{Mural} = '${muralId}'`;

    if (agencyId) {
        filter = `AND({Mural} = '${muralId}', {AgencyId} = '${agencyId}')`;
    }

    try {
        const records = await base('MuralReadLog').select({
            filterByFormula: filter,
            sort: [{ field: 'Timestamp', direction: 'desc' }]
        }).all();

        return records.map((record: any) => ({
            userName: record.fields['UserName'] as string,
            timestamp: record.fields['Timestamp'] as string
        }));
    } catch (e) {
        console.warn('Error fetching from MuralReadLog:', e);
        return [];
    }
}
