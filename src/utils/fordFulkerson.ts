import { Graph, Edge, AugmentingPath, FlowResult } from '../types/graph';

export class MaxFlowCalculator {
  private graph: Graph;
  private residualGraph: Map<string, Map<string, number>>;

  constructor(graph: Graph) {
    this.graph = JSON.parse(JSON.stringify(graph)); // Deep copy
    this.residualGraph = new Map();
    this.buildResidualGraph();
  }

  private buildResidualGraph(): void {
    // Initialize residual graph
    this.graph.nodes.forEach(node => {
      this.residualGraph.set(node.id, new Map());
    });

    // Add forward edges
    this.graph.edges.forEach(edge => {
      const fromMap = this.residualGraph.get(edge.from)!;
      fromMap.set(edge.to, edge.capacity);

      // Add backward edge with 0 capacity
      const toMap = this.residualGraph.get(edge.to)!;
      if (!toMap.has(edge.from)) {
        toMap.set(edge.from, 0);
      }
    });
  }

  private bfs(source: string, sink: string): string[] | null {
    const visited = new Set<string>();
    const queue: string[] = [source];
    const parent = new Map<string, string>();
    
    visited.add(source);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === sink) {
        // Reconstruct path
        const path = [];
        let node = sink;
        while (node !== source) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(source);
        return path;
      }

      const neighbors = this.residualGraph.get(current)!;
      for (const [neighbor, capacity] of neighbors.entries()) {
        if (!visited.has(neighbor) && capacity > 0) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    return null; // No path found
  }

  private getPathBottleneck(path: string[]): number {
    let minCapacity = Infinity;

    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const capacity = this.residualGraph.get(from)!.get(to)!;
      minCapacity = Math.min(minCapacity, capacity);
    }

    return minCapacity;
  }

  private updateResidualGraph(path: string[], flow: number): void {
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      // Decrease forward edge
      const fromMap = this.residualGraph.get(from)!;
      fromMap.set(to, fromMap.get(to)! - flow);

      // Increase backward edge
      const toMap = this.residualGraph.get(to)!;
      toMap.set(from, toMap.get(from)! + flow);
    }
  }

  private updateGraphFlow(path: string[], flow: number): void {
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      // Find the original edge and update its flow
      const edge = this.graph.edges.find(e => e.from === from && e.to === to);
      if (edge) {
        edge.flow += flow;
      } else {
        // This might be a backward flow, decrease the flow of the reverse edge
        const reverseEdge = this.graph.edges.find(e => e.from === to && e.to === from);
        if (reverseEdge) {
          reverseEdge.flow = Math.max(0, reverseEdge.flow - flow);
        }
      }
    }
  }

  calculateMaxFlow(source: string, sink: string): FlowResult {
    const paths: AugmentingPath[] = [];
    let maxFlow = 0;

    // Initialize flow to 0 for all edges
    this.graph.edges.forEach(edge => {
      edge.flow = 0;
    });

    while (true) {
      const path = this.bfs(source, sink);
      if (!path) break;

      const bottleneck = this.getPathBottleneck(path);
      paths.push({ path: [...path], bottleneck });

      this.updateResidualGraph(path, bottleneck);
      this.updateGraphFlow(path, bottleneck);
      maxFlow += bottleneck;
    }

    return {
      maxFlow,
      paths,
      finalGraph: this.graph
    };
  }
}