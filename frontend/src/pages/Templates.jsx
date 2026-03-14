import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import { templatesAPI, workflowAPI } from '../api/client';
import { Copy, Loader2, Sparkles } from 'lucide-react';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forkingId, setForkingId] = useState(null);
  const navigate = useNavigate();
  const { setCurrentWorkflow, setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    templatesAPI.list().then(res => {
      setTemplates(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUseTemplate = async (template) => {
    setForkingId(template.id);
    try {
      // Create fork on backend
      const res = await templatesAPI.fork(template.id);
      
      // Load it into Zustand
      const wfRes = await workflowAPI.get(res.data.workflow);
      const wf = wfRes.data;
      
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      setCurrentWorkflow(wf);
      
      navigate('/builder');
    } catch (e) {
      alert("Error loading template: " + e.message);
    } finally {
      setForkingId(null);
    }
  };

  if (loading) {
      return <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center text-white"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
               <Sparkles className="text-purple-500" /> Template Marketplace
            </h1>
            <p className="text-gray-400 text-lg">One-click automations for your business, running locally.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t.id} className="bg-dark-900 border border-white/10 p-6 rounded-2xl hover:border-purple-500/50 transition-colors group">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">{t.category}</div>
                <h3 className="text-xl font-bold mb-3">{t.name}</h3>
                <p className="text-gray-400 text-sm mb-6 h-12 line-clamp-2">{t.description}</p>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t.use_count} uses</span>
                    <button 
                        onClick={() => handleUseTemplate(t)}
                        disabled={forkingId === t.id}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 group-hover:bg-purple-600 transition-colors"
                    >
                        {forkingId === t.id ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                        Use Template
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
