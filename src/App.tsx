import React, { useState, useCallback } from 'react';
import { Network, FileText, AlertTriangle } from 'lucide-react';
import { Graph, Node, Edge, FlowResult } from './types/graph';
import { GraphCanvas } from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { MaxFlowCalculator } from './utils/fordFulkerson';

function App() {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [source, setSource] = useState<string>('');
  const [sink, setSink] = useState<string>('');
  const [result, setResult] = useState<FlowResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<number>(-1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string>('');

  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  const handleAddNode = useCallback((id: string, type: 'normal' | 'source' | 'sink') => {
    if (graph.nodes.some(n => n.id === id)) {
      setError(`Le nœud "${id}" existe déjà.`);
      return;
    }

    const newNode: Node = {
      id,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      type
    };

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setError('');
  }, [graph.nodes]);

  const handleAddEdge = useCallback((from: string, to: string, capacity: number) => {
    if (!graph.nodes.some(n => n.id === from)) {
      setError(`Le nœud de départ "${from}" n'existe pas.`);
      return;
    }
    if (!graph.nodes.some(n => n.id === to)) {
      setError(`Le nœud d'arrivée "${to}" n'existe pas.`);
      return;
    }
    if (from === to) {
      setError('Un arc ne peut pas boucler sur lui-même.');
      return;
    }
    if (graph.edges.some(e => e.from === from && e.to === to)) {
      setError(`Un arc de "${from}" vers "${to}" existe déjà.`);
      return;
    }
    if (capacity <= 0) {
      setError('La capacité doit être positive.');
      return;
    }

    const newEdge: Edge = {
      id: generateId(),
      from,
      to,
      capacity,
      flow: 0
    };

    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
    setError('');
  }, [graph.nodes, graph.edges, generateId]);

  const handleAddBatchEdges = useCallback((edgeData: string) => {
    const lines = edgeData.trim().split('\n');
    const errors: string[] = [];
    const newEdges: Edge[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 3) {
        errors.push(`Ligne ${i + 1}: Format incorrect (attendu: Départ,Arrivée,Capacité)`);
        continue;
      }

      const [from, to, capacityStr] = parts;
      const capacity = parseInt(capacityStr);

      if (!graph.nodes.some(n => n.id === from)) {
        errors.push(`Ligne ${i + 1}: Le nœud "${from}" n'existe pas`);
        continue;
      }
      if (!graph.nodes.some(n => n.id === to)) {
        errors.push(`Ligne ${i + 1}: Le nœud "${to}" n'existe pas`);
        continue;
      }
      if (from === to) {
        errors.push(`Ligne ${i + 1}: Un arc ne peut pas boucler sur lui-même`);
        continue;
      }
      if (isNaN(capacity) || capacity <= 0) {
        errors.push(`Ligne ${i + 1}: Capacité invalide "${capacityStr}"`);
        continue;
      }
      if ([...graph.edges, ...newEdges].some(e => e.from === from && e.to === to)) {
        errors.push(`Ligne ${i + 1}: Arc de "${from}" vers "${to}" déjà existant`);
        continue;
      }

      newEdges.push({
        id: generateId(),
        from,
        to,
        capacity,
        flow: 0
      });
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    if (newEdges.length > 0) {
      setGraph(prev => ({
        ...prev,
        edges: [...prev.edges, ...newEdges]
      }));
      setError('');
    }
  }, [graph.nodes, graph.edges, generateId]);

  const handleSetSource = useCallback((nodeId: string) => {
    // Reset previous source
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.type === 'source' ? { ...n, type: 'normal' as const } : n
      )
    }));
    
    // Set new source
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === nodeId ? { ...n, type: 'source' as const } : n
      )
    }));
    
    setSource(nodeId);
    setResult(null);
    setSelectedPath(-1);
  }, []);

  const handleSetSink = useCallback((nodeId: string) => {
    // Reset previous sink
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.type === 'sink' ? { ...n, type: 'normal' as const } : n
      )
    }));
    
    // Set new sink
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === nodeId ? { ...n, type: 'sink' as const } : n
      )
    }));
    
    setSink(nodeId);
    setResult(null);
    setSelectedPath(-1);
  }, []);

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => 
        n.id === nodeId ? { ...n, x, y } : n
      )
    }));
  }, []);

  const handleCalculateFlow = useCallback(async () => {
    if (!source || !sink) {
      setError('Veuillez définir une source et un puits.');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calculator = new MaxFlowCalculator(graph);
      const flowResult = calculator.calculateMaxFlow(source, sink);
      
      setResult(flowResult);
      setGraph(flowResult.finalGraph);
      setSelectedPath(-1);
    } catch (err) {
      setError('Erreur lors du calcul du flot maximum: ' + (err as Error).message);
    } finally {
      setIsCalculating(false);
    }
  }, [graph, source, sink]);

  const handleReset = useCallback(() => {
    setGraph({ nodes: [], edges: [] });
    setSource('');
    setSink('');
    setResult(null);
    setSelectedPath(-1);
    setError('');
  }, []);

  const handleExportGraph = useCallback(() => {
    const data = {
      graph,
      source,
      sink,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [graph, source, sink]);

  const handleImportGraph = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.graph && parsed.graph.nodes && parsed.graph.edges) {
        setGraph(parsed.graph);
        setSource(parsed.source || '');
        setSink(parsed.sink || '');
        setResult(null);
        setSelectedPath(-1);
        setError('');
      } else {
        setError('Format de fichier invalide.');
      }
    } catch (err) {
      setError('Erreur lors de l\'importation: fichier corrompu.');
    }
  }, []);

  const getHighlightedPath = useCallback(() => {
    if (result && selectedPath >= 0 && selectedPath < result.paths.length) {
      return result.paths[selectedPath].path;
    }
    return [];
  }, [result, selectedPath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Network className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Simulateur de Flot Maximum
              </h1>
              <p className="text-gray-600">Réseau de Canalisations - Algorithme de Ford-Fulkerson</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-red-800">Erreur</h3>
              <pre className="text-red-700 text-sm mt-1 whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel
              graph={graph}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onAddBatchEdges={handleAddBatchEdges}
              onSetSource={handleSetSource}
              onSetSink={handleSetSink}
              onReset={handleReset}
              onCalculateFlow={handleCalculateFlow}
              onExportGraph={handleExportGraph}
              onImportGraph={handleImportGraph}
              source={source}
              sink={sink}
              isCalculating={isCalculating}
            />
          </div>

          {/* Graph Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Graphe du Réseau</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Source</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Puits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span>Normal</span>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <GraphCanvas
                  graph={graph}
                  onNodeMove={handleNodeMove}
                  onNodeClick={() => {}}
                  highlightedPath={getHighlightedPath()}
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <ResultsPanel
              result={result}
              onPathSelect={setSelectedPath}
              selectedPath={selectedPath}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <FileText className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions d'utilisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">1. Construction du graphe</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Ajoutez des nœuds avec des identifiants uniques</li>
                    <li>Définissez une source (nœud vert) et un puits (nœud rouge)</li>
                    <li>Ajoutez des arcs avec leurs capacités</li>
                    <li>Déplacez les nœuds en les faisant glisser</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">2. Calcul du flot</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Cliquez sur "Calculer le Flot Maximum"</li>
                    <li>Visualisez les chemins augmentants trouvés</li>
                    <li>Cliquez sur un chemin pour le surligner</li>
                    <li>Exportez vos résultats si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;