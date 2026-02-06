export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}
