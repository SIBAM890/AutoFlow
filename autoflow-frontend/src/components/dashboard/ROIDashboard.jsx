import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, Clock, MessageSquare, IndianRupee } from 'lucide-react';
import clsx from 'clsx';

const data = [
    { name: 'Mon', messages: 40, saved: 20 },
    { name: 'Tue', messages: 80, saved: 45 },
    { name: 'Wed', messages: 110, saved: 70 },
    { name: 'Thu', messages: 147, saved: 129 },
    { name: 'Fri', messages: 0, saved: 0 },
    { name: 'Sat', messages: 0, saved: 0 },
    { name: 'Sun', messages: 0, saved: 0 },
];

const MetricCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            <p className={clsx("text-sm mt-1 flex items-center gap-1", color === 'green' ? "text-green-600" : "text-blue-600")}>
                <ArrowUpRight size={14} />
                {subtext}
            </p>
        </div>
        <div className={clsx("p-3 rounded-lg", color === 'green' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")}>
            <Icon size={24} />
        </div>
    </div>
);

export const ROIDashboard = () => {
    return (
        <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Messages Automated"
                    value="147"
                    subtext="+12% from yesterday"
                    icon={MessageSquare}
                    color="blue"
                />
                <MetricCard
                    title="Time Saved"
                    value="4.3 hrs"
                    subtext="≈ ₹1,200 labor cost"
                    icon={Clock}
                    color="green"
                />
                <MetricCard
                    title="Value Created"
                    value="₹12,450"
                    subtext="From closed orders"
                    icon={IndianRupee}
                    color="green"
                />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Automation Impact</h3>
                        <p className="text-gray-500 text-sm">Real-time savings analysis</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ROI: 2,585% 🚀
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="saved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
                            <Line type="monotone" dataKey="messages" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
