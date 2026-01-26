import { useState } from 'react';
import { Search, MessageSquare, Zap, Divide, MousePointerClick, ChevronRight, ChevronDown, CheckCircle, Link, Mail, Smartphone, Database, ShoppingCart, Globe, CreditCard, Users, Code, Cloud, Clock, Bot, Facebook, Twitter, Instagram, Linkedin, Slack, Github, Trello, Calendar } from 'lucide-react';
import { TOOL_CATEGORIES } from '../../constants/tools';
import clsx from 'clsx';

// Icon mapping helper
const IconMap = {
    MessageSquare, Zap, Divide, Link, Mail, Smartphone, Database, ShoppingCart,
    Globe, CreditCard, Users, Code, Cloud, Clock, Bot, Facebook, Twitter,
    Instagram, Linkedin, Slack, Github, Trello, Calendar
};

export const NodePalette = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(['core', 'communication']);

    const onDragStart = (event, tool) => {
        // Pass strictly the type expected by WorkflowGraph logic
        // We send 'custom' as primary type logic, but we need to encode specificity
        // Actually WorkflowGraph uses the string directly as type/label logic
        // Let's pass the 'id' which is like 'whatsapp', 'gmail'
        event.dataTransfer.setData('application/reactflow', tool.id);
        event.dataTransfer.effectAllowed = 'move';
    };

    const toggleCategory = (id) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    // Filter tools based on search
    const filteredCategories = TOOL_CATEGORIES.map(cat => ({
        ...cat,
        tools: cat.tools.filter(tool =>
            tool.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.tools.length > 0);

    return (
        <div className="bg-white border-l border-gray-200 w-full h-full flex flex-col shadow-xl z-20">

            {/* Search Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    Toolbox
                    <span className="bg-purple-100 text-purple-600 text-[10px] py-0.5 px-2 rounded-full">100+</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredCategories.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        No tools found matching "{searchQuery}"
                    </div>
                ) : (
                    filteredCategories.map(category => (
                        <div key={category.id} className="border border-gray-100 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {category.name}
                                {expandedCategories.includes(category.id) || searchQuery ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {(expandedCategories.includes(category.id) || searchQuery) && (
                                <div className="p-2 grid grid-cols-1 gap-2 bg-white">
                                    {category.tools.map(tool => {
                                        const IconComponent = IconMap[tool.icon] || Zap;
                                        return (
                                            <div
                                                key={tool.id}
                                                className={clsx(
                                                    "flex items-center gap-3 p-2 rounded-md border cursor-grab hover:shadow-md transition-all active:cursor-grabbing",
                                                    tool.type === 'trigger' ? "bg-green-50 border-green-100 hover:border-green-300" :
                                                        tool.type === 'condition' ? "bg-yellow-50 border-yellow-100 hover:border-yellow-300" :
                                                            "bg-white border-gray-200 hover:border-purple-300 hover:bg-blue-50"
                                                )}
                                                onDragStart={(event) => onDragStart(event, tool)}
                                                draggable
                                                title={`Drag to add ${tool.label}`}
                                            >
                                                <div className={clsx(
                                                    "p-1.5 rounded-md text-white shrink-0",
                                                    tool.type === 'trigger' ? "bg-green-500" :
                                                        tool.type === 'condition' ? "bg-yellow-500" :
                                                            "bg-blue-500"
                                                )}>
                                                    <IconComponent size={14} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 truncate">{tool.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100">
                Drag & Drop to build
            </div>
        </div>
    );
};
