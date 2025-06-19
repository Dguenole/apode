import React, { useState } from 'react';
import { Plus, Download, Upload, RotateCcw, Play } from 'lucide-react';
import { Graph, Node, Edge } from '../types/graph';

interface ControlPanelProps {
  graph: Graph;
  onAddNode: (id: string, type: 'normal' | 'source' | 'sink') => void;
  onAddEdge: (from: string, to: string, capacity: number) => void;
  onAddBatchEdges: (edgeData: string) => void;
  onSetSource: (nodeId: string) => void;
  onSetSink: (nodeId: string) => void;
  onReset: () => void;
  onCalculateFlow: () => void;
  onExportGraph: () => void;
  onImportGraph: (data: string) => void;
  source?: string;
  sink?: string;
  isCalculating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  graph,
  onAddNode,
  onAddEdge,
  onAddBatchEdges,
  onSetSource,
  onSetSink,
  onReset,
  onCalculateFlow,
  onExportGraph,
  onImportGraph,
  source,
  sink,
  isCalculating
}) => {
  const [newNodeId, setNewNodeId] = useState('');
  const [newEdgeFrom, setNewEdgeFrom] = useState('');
  const [newEdgeTo, setNewEdgeTo] = useState('');
  const [newEdgeCapacity, setNewEdgeCapacity] = useState('');
  const [batchEdges, setBatchEdges] = useState('');
  const [selectedSource, setSelectedSource] = useState(source || '');
  const [selectedSink, setSelectedSink] = useState(sink || '');

  const handleAddNode = () => {
    if (newNodeId.trim()) {
      onAddNode(newNodeId.trim(), 'normal');
      setNewNodeId('');
    }
  };

  const handleAddEdge = () => {
    const capacity = parseInt(newEdgeCapacity);
    if (newEdgeFrom && newEdgeTo && capacity > 0) {
      onAddEdge(newEdgeFrom, newEdgeTo, capacity);
      setNewEdgeFrom('');
      setNewEdgeTo('');
      setNewEdgeCapacity('');
    }
  };

  const handleBatchEdges = () => {
    if (batchEdges.trim()) {
      onAddBatchEdges(batchEdges);
      setBatchEdges('');
    }
  };

  const handleSetSource = () => {
    if (selectedSource) {
      onSetSource(selectedSource);
    }
  };

  const handleSetSink = () => {
    if (selectedSink) {
      onSetSink(selectedSink);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        onImportGraph(data);
      };
      reader.readAsText(file);
    }
  };

  const nodeIds = graph.nodes.map(n => n.id);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Panneau de Contrôle</h2>
      
      {/* Add Node */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Ajouter un Nœud</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            placeholder="ID du nœud (ex: A, B, C...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
          />
          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Set Source and Sink */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <div className="flex gap-2">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sélectionner</option>
              {nodeIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <button
              onClick={handleSetSource}
              disabled={!selectedSource}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Définir
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Puits</label>
          <div className="flex gap-2">
            <select
              value={selectedSink}
              onChange={(e) => setSelectedSink(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Sélectionner</option>
              {nodeIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <button
              onClick={handleSetSink}
              disabled={!selectedSink}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Définir
            </button>
          </div>
        </div>
      </div>

      {/* Add Single Edge */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Ajouter un Arc</h3>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={newEdgeFrom}
            onChange={(e) => setNewEdgeFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Départ</option>
            {nodeIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <select
            value={newEdgeTo}
            onChange={(e) => setNewEdgeTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Arrivée</option>
            {nodeIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
          <input
            type="number"
            value={newEdgeCapacity}
            onChange={(e) => setNewEdgeCapacity(e.target.value)}
            placeholder="Capacité"
            min="1"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddEdge}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Ajouter l'Arc
        </button>
      </div>

      {/* Batch Add Edges */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Ajouter par Lot</h3>
        <textarea
          value={batchEdges}
          onChange={(e) => setBatchEdges(e.target.value)}
          placeholder="Format: Départ,Arrivée,Capacité (une ligne par arc)&#10;Exemple:&#10;A,B,10&#10;B,C,15&#10;A,C,20"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleBatchEdges}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Ajouter les Arcs
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onCalculateFlow}
          disabled={!source || !sink || graph.nodes.length < 2 || isCalculating}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play size={16} />
          {isCalculating ? 'Calcul en cours...' : 'Calculer le Flot Maximum'}
        </button>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onReset}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={onExportGraph}
            disabled={graph.nodes.length === 0}
            className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Download size={14} />
            Export
          </button>
          <label className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors cursor-pointer flex items-center justify-center gap-1">
            <Upload size={14} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};