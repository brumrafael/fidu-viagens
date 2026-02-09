import { NextRequest, NextResponse } from 'next/server';
import { getNoticeReaders } from '@/lib/airtable/service';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const noticeId = searchParams.get('noticeId');

    // Structured Log Init
    const logData = {
        event: "read-log-request",
        baseIdPrefix: (process.env.AIRTABLE_BASE_ID || '').substring(0, 7) + '...',
        noticeId: noticeId,
        returnedCount: 0,
        errorStack: null as string | null
    };

    if (!noticeId) {
        return NextResponse.json({ success: false, readers: [], error: 'Missing noticeId' }, { status: 400 });
    }

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ success: false, readers: [], error: 'Unauthorized' }, { status: 401 });
        }


        // Wait, the original fetchMuralReaders checked for agency. 
        // We probably want to reuse that logic or simplify. 
        // The user requirement says: "Buscar na tabela Notice_read_log... Retornar lista de leitores".
        // And "Manter a lista LIDO POR independente de campos lookup mal configurados".
        // `getNoticeReaders` in service.ts handles logic.

        // Optimizing: The original action `fetchMuralReaders` also did permission checks (agency access).
        // Reuse `getNoticeReaders` but we might need to fetch agency context if we want to filter like the action did.
        // For now, let's assume we want to show ALL readers to everyone? 
        // Re-reading `MuralModal.tsx`: it shows readers. 
        // Re-reading `service.ts`: `getNoticeReaders` filters by agency if not admin.
        // I should probably replicate the secure context check here if I can, OR just return all if that's the requirement.
        // User said: "Retornar lista de leitores (usuários) e timestamps".
        // I will assume for now we return what `getNoticeReaders` returns, passing isAdmin=true to get everyone? 
        // Or better: Let's allow `getNoticeReaders` to handle it if we pass nothing?
        // In `service.ts`, `getNoticeReaders(noticeId, agencyRecordId, isAdmin)`
        // If I don't pass agencyRecordId, it might return empty for non-admins.

        // I need to fetch the agency of the current user to pass to `getNoticeReaders`.
        // This duplicates logic in `fetchMuralReaders` action, but API routes need their own auth context.

        // Actually, the user requirement for `read-log` endpoint was simple:
        // "Retornar lista de leitores (usuários)..."
        // I'll stick to a robust implementation that fetches the agency first.

        // Note: I can't import `getAgencyByEmail` efficiently without `service.ts` import which I have.

        // Wait, to avoid duplication and keep it fast, I will just call `getNoticeReaders` with `isAdmin=true` for now?
        // No, that leaks info. 
        // Let's do it properly.

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) throw new Error('No email found in session');

        // We need `getAgencyByEmail` to get context
        // But `getAgencyByEmail` is in `service.ts`.
        // I need to be careful about circular deps or heavy usage? Should be fine.

        // Let's try to keep it simple as requested.
        // The user didn't explicitly forbid re-fetching agency.

        // IMPROVEMENT: I will trust `getNoticeReaders` handles its logic if I pass the right args.
        // I will call `getAgencyByEmail` here.

        const { getAgencyByEmail } = await import('@/lib/airtable/service');
        const agency = await getAgencyByEmail(email);

        if (!agency) {
            throw new Error('Agency not found for user');
        }

        const readers = await getNoticeReaders(noticeId, agency.id, !!agency.isAdmin);

        logData.returnedCount = readers.length;
        console.log(JSON.stringify(logData));

        return NextResponse.json({
            success: true,
            readers: readers
        });

    } catch (error: any) {
        logData.errorStack = error.stack || error.message;
        console.error(JSON.stringify(logData));
        return NextResponse.json({ success: false, readers: [], error: error.message }, { status: 500 });
    }
}
