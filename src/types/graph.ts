export interface Node {
  id: string;
  x: number;
  y: number;
  type: 'normal' | 'source' | 'sink';
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  capacity: number;
  flow: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface AugmentingPath {
  path: string[];
  bottleneck: number;
}

export interface FlowResult {
  maxFlow: number;
  paths: AugmentingPath[];
  finalGraph: Graph;
}