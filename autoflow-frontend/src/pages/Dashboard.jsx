import { Link } from 'react-router-dom';
import { ROIDashboard } from '../components/dashboard/ROIDashboard';
import { Plus, Zap, Settings } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Zap className="text-blue-600" fill="currentColor" />
                            <span className="font-bold text-xl text-gray-900">AutoFlow AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Settings size={20} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                S
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Sibam 👋</h1>
                        <p className="text-gray-500 mt-1">Here's how your automation is performing today.</p>
                    </div>
                    <Link
                        to="/builder"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} />
                        New Automation
                    </Link>
                </div>

                {/* ROI Dashboard */}
                <ROIDashboard />

                {/* Active Automations List */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Active Workflows</h2>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {/* Item 1 */}
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Product Price Inquiry</h4>
                                    <p className="text-sm text-gray-500">Triggers on "price", "cost"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                                <span className="text-sm text-gray-500">24m ago</span>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Order Status Check</h4>
                                    <p className="text-sm text-gray-500">Triggers on "track", "where is"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                                <span className="text-sm text-gray-500">1h ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Start Icon for the list
import { MessageSquare } from 'lucide-react';

export default Dashboard;
