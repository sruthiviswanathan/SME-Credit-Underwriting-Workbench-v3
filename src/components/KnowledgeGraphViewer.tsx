import React, { useState, useEffect } from 'react';
import { Network, Layers, Info, CheckCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { GraphEdge, GraphNode } from '../types';

interface KnowledgeGraphViewerProps {
  applicationId: string;
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({ applicationId }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGraph();
  }, [applicationId]);

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/knowledge-graph/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch knowledge graph', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'APPLICATION':
        return {
          bg: 'bg-blue-950/90 border-blue-500 text-blue-200',
          dot: 'bg-blue-400',
          badge: 'bg-blue-900/60 text-blue-300',
        };
      case 'PARTY':
        return {
          bg: 'bg-cyan-950/90 border-cyan-500 text-cyan-200',
          dot: 'bg-cyan-400',
          badge: 'bg-cyan-900/60 text-cyan-300',
        };
      case 'GUARANTOR':
        return {
          bg: 'bg-purple-950/90 border-purple-500 text-purple-200',
          dot: 'bg-purple-400',
          badge: 'bg-purple-900/60 text-purple-300',
        };
      case 'MEASURE':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500 text-emerald-200',
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-900/60 text-emerald-300',
        };
      case 'EVIDENCE':
        return {
          bg: 'bg-amber-950/90 border-amber-500 text-amber-200',
          dot: 'bg-amber-400',
          badge: 'bg-amber-900/60 text-amber-300',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-200',
          dot: 'bg-slate-400',
          badge: 'bg-slate-800 text-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Graph Header */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Enterprise Knowledge Graph & Relationship Traversal
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Traverse entity networks, 2-hop natural person guarantors, segregated financial measures, and evidence nodes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> :Party
          </span>
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> :Application
          </span>
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> :Guarantor
          </span>
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> :Measure
          </span>
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> :Evidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Canvas / Interactive Map (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-6 min-h-[460px] relative overflow-hidden shadow-inner flex flex-col justify-between">
          <div className="absolute top-3 left-4 text-xs font-mono text-slate-500">
            Graph View: Cypher 5.x Runtime Context (Nodes: {nodes.length}, Edges: {edges.length})
          </div>

          {/* Render Interactive Nodes in a visually pleasing structured ontology tree */}
          <div className="my-8 flex flex-col items-center justify-center gap-8">
            {/* Top Level: Application & Party Node */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {nodes
                .filter((n) => n.type === 'APPLICATION' || n.type === 'PARTY')
                .map((node) => {
                  const colors = getNodeColor(node.type);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer shadow-lg max-w-xs ${colors.bg} ${
                        isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                        <span className="text-xs font-mono font-bold uppercase">{node.type}</span>
                      </div>
                      <p className="text-sm font-bold text-white mt-1 truncate">{node.label}</p>
                    </div>
                  );
                })}
            </div>

            {/* Middle Level: Guarantors & Segregated Measures */}
            <div className="w-full flex flex-wrap items-center justify-center gap-4">
              {nodes
                .filter((n) => n.type === 'GUARANTOR' || n.type === 'MEASURE')
                .map((node) => {
                  const colors = getNodeColor(node.type);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-xs ${colors.bg} ${
                        isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                          <span className="truncate max-w-[140px]">{node.label}</span>
                        </div>
                      </div>
                      {node.properties.value && (
                        <div className="mt-1 font-mono font-bold text-emerald-400">
                          {node.properties.value}
                        </div>
                      )}
                      {node.properties.has_default && (
                        <span className="mt-1 inline-block text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">
                          DEFAULT DETECTED
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Bottom Level: Evidence Ingestion Vault Nodes */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3">
              {nodes
                .filter((n) => n.type === 'EVIDENCE')
                .map((node) => {
                  const colors = getNodeColor(node.type);
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer text-[11px] ${colors.bg} ${
                        isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold truncate max-w-[150px]">
                        <span>📄</span>
                        <span className="truncate">{node.label}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Hash: {node.properties.sha256}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>Graph Traversals: Direct Ownership, 2-Hop Guarantees, Source Provenance</span>
            <span className="font-mono text-cyan-400">Pre-Retrieval Tenant Filter: ACTIVE</span>
          </div>
        </div>

        {/* Selected Node Property Inspector (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Node Property Inspector
                </h3>
              </div>
              {selectedNode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedNode.type}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Node Identifier / Label</span>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">{selectedNode.label}</p>
                </div>

                <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-500 font-sans uppercase text-[10px] block mb-1">
                    Canonical Graph Properties
                  </span>
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-bold text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>

                {selectedNode.type === 'GUARANTOR' && (
                  <div className="p-3 bg-purple-950/40 rounded-lg border border-purple-800/60 text-purple-200 text-xs">
                    <span className="font-bold">Guarantor Traversal Rule:</span> Multi-hop graph search inspects
                    commercial credit bureaus for natural persons possessing &gt;25% equity ownership or formal
                    guarantees.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click any node on the graph to inspect properties.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Isolated Partition: <code className="text-slate-400">TENANT-BANK-ALPHA</code>
          </div>
        </div>
      </div>
    </div>
  );
};
