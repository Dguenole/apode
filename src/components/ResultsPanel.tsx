import React from 'react';
import { FlowResult } from '../types/graph';

interface ResultsPanelProps {
  result: FlowResult | null;
  onPathSelect: (pathIndex: number) => void;
  selectedPath: number;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  onPathSelect,
  selectedPath
}) => {
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Résultats</h2>
        <p className="text-gray-600">Aucun calcul effectué. Configurez votre réseau et cliquez sur "Calculer le Flot Maximum".</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Résultats</h2>
      
      <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-800">Flot Maximum</h3>
        <p className="text-3xl font-bold text-orange-600">{result.maxFlow}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Chemins Augmentants ({result.paths.length})</h3>
        
        {result.paths.length === 0 ? (
          <p className="text-gray-600 italic">Aucun chemin augmentant trouvé.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {result.paths.map((path, index) => (
              <div
                key={index}
                onClick={() => onPathSelect(index)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPath === index
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Chemin {index + 1}: {path.path.join(' → ')}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Flot: {path.bottleneck}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">État Final du Réseau</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Nœuds:</strong> {result.finalGraph.nodes.length}</p>
          <p><strong>Arcs:</strong> {result.finalGraph.edges.length}</p>
          <p><strong>Arcs saturés:</strong> {result.finalGraph.edges.filter(e => e.flow === e.capacity).length}</p>
        </div>
      </div>
    </div>
  );
};