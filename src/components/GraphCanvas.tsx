import React, { useRef, useEffect, useState } from 'react';
import { Graph, Node, Edge } from '../types/graph';

interface GraphCanvasProps {
  graph: Graph;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeClick: (nodeId: string) => void;
  selectedNode?: string;
  highlightedPath?: string[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  onNodeMove,
  onNodeClick,
  selectedNode,
  highlightedPath = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button === 0) { // Left click
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const node = graph.nodes.find(n => n.id === nodeId)!;
      
      setDraggedNode(nodeId);
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      });
      
      onNodeClick(nodeId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      // Keep nodes within bounds
      const clampedX = Math.max(30, Math.min(rect.width - 30, newX));
      const clampedY = Math.max(30, Math.min(rect.height - 30, newY));
      
      onNodeMove(draggedNode, clampedX, clampedY);
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const getNodeColor = (node: Node) => {
    if (node.type === 'source') return '#10B981'; // Green
    if (node.type === 'sink') return '#EF4444'; // Red
    if (selectedNode === node.id) return '#3B82F6'; // Blue
    return '#6B7280'; // Gray
  };

  const isEdgeHighlighted = (edge: Edge) => {
    if (highlightedPath.length < 2) return false;
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      if (highlightedPath[i] === edge.from && highlightedPath[i + 1] === edge.to) {
        return true;
      }
    }
    return false;
  };

  const calculateEdgePosition = (from: Node, to: Node) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    const radius = 25;
    const startX = from.x + unitX * radius;
    const startY = from.y + unitY * radius;
    const endX = to.x - unitX * radius;
    const endY = to.y - unitY * radius;
    
    return { startX, startY, endX, endY, unitX, unitY };
  };

  const renderArrowHead = (edge: Edge, pos: ReturnType<typeof calculateEdgePosition>) => {
    const arrowSize = 8;
    const arrowX = pos.endX;
    const arrowY = pos.endY;
    
    const angle = Math.atan2(pos.endY - pos.startY, pos.endX - pos.startX);
    const arrowPoint1X = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
    const arrowPoint1Y = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
    const arrowPoint2X = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
    const arrowPoint2Y = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);
    
    return (
      <polygon
        points={`${arrowX},${arrowY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
        fill={isEdgeHighlighted(edge) ? '#F59E0B' : '#6B7280'}
        stroke="none"
      />
    );
  };

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg bg-white">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Render edges */}
        {graph.edges.map(edge => {
          const fromNode = graph.nodes.find(n => n.id === edge.from);
          const toNode = graph.nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;
          
          const pos = calculateEdgePosition(fromNode, toNode);
          const isHighlighted = isEdgeHighlighted(edge);
          
          return (
            <g key={edge.id}>
              <line
                x1={pos.startX}
                y1={pos.startY}
                x2={pos.endX}
                y2={pos.endY}
                stroke={isHighlighted ? '#F59E0B' : '#6B7280'}
                strokeWidth={isHighlighted ? 3 : 2}
                markerEnd="url(#arrowhead)"
              />
              {renderArrowHead(edge, pos)}
              
              {/* Capacity/Flow label */}
              <text
                x={(pos.startX + pos.endX) / 2}
                y={(pos.startY + pos.endY) / 2 - 5}
                textAnchor="middle"
                fontSize="12"
                fill={isHighlighted ? '#F59E0B' : '#374151'}
                fontWeight={isHighlighted ? 'bold' : 'normal'}
                className="pointer-events-none select-none"
              >
                {edge.flow > 0 ? `${edge.flow}/${edge.capacity}` : `${edge.capacity}`}
              </text>
            </g>
          );
        })}
        
        {/* Render nodes */}
        {graph.nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="25"
              fill={getNodeColor(node)}
              stroke="#fff"
              strokeWidth="3"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, node.id)}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="white"
              className="pointer-events-none select-none"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};