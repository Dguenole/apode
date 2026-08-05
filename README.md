# AppFlow — Simulateur de flot maximal

Application de visualisation interactive de l'algorithme **Ford-Fulkerson** de calcul du flot maximal dans un réseau de transport. On dessine le graphe à la souris, on définit les capacités, et l'application affiche le flot maximal ainsi que chaque chemin augmentant utilisé pour l'obtenir.

---

## Fonctionnalités

- **Éditeur de graphe visuel** — création de nœuds et d'arcs directement sur le canvas
- **Typage des nœuds** — source, puits, ou nœud intermédiaire
- **Capacités personnalisables** — chaque arc porte sa capacité maximale
- **Calcul du flot maximal** — implémentation de Ford-Fulkerson avec recherche BFS (variante Edmonds-Karp)
- **Détail des chemins augmentants** — chaque chemin trouvé est affiché avec son goulot d'étranglement
- **Application de bureau** — packagée avec Tauri (Windows, macOS, Linux) en plus du mode web

---

## Le problème du flot maximal

Étant donné un réseau orienté où chaque arc a une capacité, quelle quantité maximale peut circuler d'une **source** vers un **puits** sans dépasser la capacité d'aucun arc ?

L'algorithme de Ford-Fulkerson procède par itérations :

1. Construire le **graphe résiduel** (capacités restantes + arcs retour)
2. Chercher un **chemin augmentant** de la source au puits (ici par parcours en largeur / BFS)
3. Identifier le **goulot d'étranglement** — la capacité résiduelle minimale sur ce chemin
4. Pousser ce flot le long du chemin et mettre à jour le graphe résiduel
5. Répéter jusqu'à ce qu'aucun chemin augmentant n'existe

Le flot total accumulé est alors maximal.

---

## Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.3 | Interface utilisateur |
| TypeScript | 5.5 | Typage statique |
| Vite | 5.4 | Bundler et serveur de dev |
| Tailwind CSS | 3.4 | Styles |
| lucide-react | 0.344 | Icônes |
| Tauri | 2.5 | Empaquetage en application de bureau (Rust) |
| ESLint | 9 | Qualité du code |

---

## Structure du projet

```
apode/
├── src/
│   ├── App.tsx                    # Composant racine, état global du graphe
│   ├── components/
│   │   ├── GraphCanvas.tsx        # Canvas d'édition : nœuds, arcs, interactions
│   │   ├── ControlPanel.tsx       # Contrôles : ajout/suppression, lancement du calcul
│   │   └── ResultsPanel.tsx       # Flot maximal et liste des chemins augmentants
│   ├── types/
│   │   └── graph.ts               # Node, Edge, Graph, AugmentingPath, FlowResult
│   ├── utils/
│   │   └── fordFulkerson.ts       # MaxFlowCalculator — graphe résiduel + BFS
│   ├── main.tsx
│   └── index.css
├── src-tauri/                     # Couche desktop Rust
│   ├── src/main.rs
│   ├── tauri.conf.json            # Config app (nom, icônes, fenêtre)
│   └── Cargo.toml
├── .github/workflows/tauri.yml    # CI — build des binaires desktop
├── vite.config.ts
└── tailwind.config.js
```

---

## Modèle de données

```ts
interface Node {
  id: string;
  x: number;
  y: number;
  type: 'normal' | 'source' | 'sink';
}

interface Edge {
  id: string;
  from: string;      // id du nœud de départ
  to: string;        // id du nœud d'arrivée
  capacity: number;  // capacité maximale
  flow: number;      // flot effectivement transporté
}

interface FlowResult {
  maxFlow: number;              // valeur du flot maximal
  paths: AugmentingPath[];      // chemins augmentants successifs
  finalGraph: Graph;            // graphe avec les flots finaux
}
```

---

## Installation

**Prérequis** : Node.js 18+ — et pour le mode desktop, [l'environnement Rust/Tauri](https://tauri.app/start/prerequisites/).

```bash
# Cloner et installer
git clone https://github.com/Dguenole/apode.git
cd apode
npm install
```

### Mode web

```bash
npm run dev       # serveur de développement (http://localhost:5173)
npm run build     # build de production dans dist/
npm run preview   # prévisualiser le build
npm run lint      # vérification ESLint
```

### Mode application de bureau

```bash
npx tauri dev     # lance l'app native en développement
npx tauri build   # génère l'installeur (.dmg / .msi / .AppImage)
```

---

## Utilisation

1. Ajouter des nœuds sur le canvas
2. Désigner un nœud comme **source** et un autre comme **puits**
3. Relier les nœuds par des arcs et saisir la capacité de chacun
4. Lancer le calcul
5. Lire le **flot maximal** et le détail de chaque chemin augmentant dans le panneau de résultats

---

## Pistes d'amélioration

- [ ] Animation pas à pas des itérations de l'algorithme
- [ ] Affichage de la coupe minimale (théorème flot-max / coupe-min)
- [ ] Import / export du graphe en JSON
- [ ] Exemples de réseaux préchargés
- [ ] Comparaison avec d'autres algorithmes (Dinic, push-relabel)

---

## Auteur

**Dguenole** — [github.com/Dguenole](https://github.com/Dguenole)
