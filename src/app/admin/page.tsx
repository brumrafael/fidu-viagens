export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Agencies</h3>
                    <p className="text-3xl font-bold text-gray-900">Loading...</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Active Products</h3>
                    <p className="text-3xl font-bold text-gray-900">Loading...</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">System Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-green-700">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
