// Relational Database Service for the Unified Workspace Dashboard

export type ItemType = 'task' | 'event' | 'document' | 'sticky';

export interface Item {
  id: string;
  workspaceId: string;
  type: ItemType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;

  // Task Engine Fields
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;

  // Event Engine Fields
  startTime?: string;
  endTime?: string;
  location?: string;

  // Canvas Engine Fields
  canvasX?: number;
  canvasY?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  canvasColor?: string; // Hex color or styling class

  // Taxonomy
  tags: string[];
}

export type RelationType = 'links_to' | 'blocks' | 'parent_of' | 'canvas_connection';

export interface ItemRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
}

export interface ActivityLog {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  timestamp: string; // ISO 8601
  action: 'create' | 'update' | 'complete' | 'delete';
  metadata?: Record<string, any>;
}

const STORAGE_KEYS = {
  ITEMS: 'unified_dashboard_items_v1',
  RELATIONS: 'unified_dashboard_relations_v1',
  LOGS: 'unified_dashboard_logs_v1',
};

// Seed Data
const DEFAULT_ITEMS: Item[] = [
  // Tasks
  {
    id: 'task-1',
    workspaceId: 'default',
    type: 'task',
    title: 'Design Polymorphic Relational Schema',
    content: 'Define columns and associations for Task, Event, Document, and Canvas models under a single table.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    canvasX: 200,
    canvasY: 150,
    canvasColor: '#8b5cf6', // Purple
    tags: ['database', 'planning'],
  },
  {
    id: 'task-2',
    workspaceId: 'default',
    type: 'task',
    title: 'Implement Canvas Engine Drag and Drop',
    content: 'Allow nodes to be dragged and positioned on the infinite canvas. Save coordinates to db.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    canvasX: 500,
    canvasY: 150,
    canvasColor: '#3b82f6', // Blue
    tags: ['canvas', 'frontend'],
  },
  {
    id: 'task-3',
    workspaceId: 'default',
    type: 'task',
    title: 'Setup Metrics Engine Velocity Charts',
    content: 'Build visual SVG charts that track daily velocity of tasks completed over the past week.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    canvasX: 800,
    canvasY: 250,
    canvasColor: '#10b981', // Green
    tags: ['analytics', 'metrics'],
  },
  {
    id: 'task-4',
    workspaceId: 'default',
    type: 'task',
    title: 'Write Verification Walkthrough',
    content: 'Draft a markdown walkthrough showing the completed app and embedded video recordings.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    canvasX: 800,
    canvasY: 450,
    canvasColor: '#eab308', // Yellow
    tags: ['documentation'],
  },

  // Events
  {
    id: 'event-1',
    workspaceId: 'default',
    type: 'event',
    title: 'Architecture Sync Meeting',
    content: 'Review the polymorphic database structure and establish conventions for many-to-many relationship mappings.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 2 days ago, 12pm
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // 2 days ago, 1pm
    location: 'Zoom / Meeting Room A',
    canvasX: 200,
    canvasY: 400,
    canvasColor: '#ef4444', // Red
    tags: ['sync', 'architecture'],
  },
  {
    id: 'event-2',
    workspaceId: 'default',
    type: 'event',
    title: 'Project Kickoff & Demo Day',
    content: 'Demonstrate the completed dashboard with task boards, schedule view, document notes, interactive canvas and visual metrics.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // In 2 days at 2pm
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
    location: 'Main Workspace',
    canvasX: 500,
    canvasY: 450,
    canvasColor: '#f97316', // Orange
    tags: ['milestone', 'demo'],
  },

  // Documents
  {
    id: 'doc-1',
    workspaceId: 'default',
    type: 'document',
    title: 'Product Requirements Document',
    content: `# Unified Workspace Platform PRD

## Overview
A high-performance workspace app matching tasks, meetings, docs, and whiteboards into a single database schema.

## Key Features
- **Task Engine**: Kanban and Checklist boards.
- **Event Engine**: Interactive schedule calendar.
- **Document Engine**: Notebook editor with relation linking.
- **Canvas Engine**: Interactive drag-and-drop node graph.
- **Metrics Engine**: Velocity tracker based on activity logs.`,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    canvasX: 200,
    canvasY: 650,
    canvasColor: '#06b6d4', // Cyan
    tags: ['prd', 'documentation'],
  },
  {
    id: 'doc-2',
    workspaceId: 'default',
    type: 'document',
    title: 'Canvas Drag-and-Drop Technical Specs',
    content: `# Canvas Tech Specs

- Use react mouse events for absolute positioning.
- Use bounding boxes to draw lines between linked item nodes.
- Maintain canvas offset ($x, y$) and zoom factor.
- Trigger auto-saves to LocalStorage on dragEnd.`,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    canvasX: 500,
    canvasY: 680,
    canvasColor: '#14b8a6', // Teal
    tags: ['technical', 'specs'],
  },

  // Stickies (Canvas Nodes)
  {
    id: 'sticky-1',
    workspaceId: 'default',
    type: 'sticky',
    title: 'Vibe Check: Aesthetic Rules',
    content: '1. Glassmorphism panels\n2. Vibrant accent colors\n3. Dark mode background\n4. Premium transitions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canvasX: 800,
    canvasY: 680,
    canvasColor: '#ec4899', // Pink
    tags: ['design', 'aesthetics'],
  }
];

const DEFAULT_RELATIONS: ItemRelation[] = [
  // Link Design Task to Architecture Sync Event
  {
    id: 'rel-1',
    sourceId: 'task-1',
    targetId: 'event-1',
    relationType: 'links_to',
  },
  // Link Architecture Sync to Product PRD doc
  {
    id: 'rel-2',
    sourceId: 'event-1',
    targetId: 'doc-1',
    relationType: 'links_to',
  },
  // Link Canvas Drag/Drop task to Tech Spec doc
  {
    id: 'rel-3',
    sourceId: 'task-2',
    targetId: 'doc-2',
    relationType: 'links_to',
  },
  // Link Canvas Task to Tech Spec doc (Canvas visual link)
  {
    id: 'rel-4',
    sourceId: 'task-2',
    targetId: 'task-3',
    relationType: 'canvas_connection',
  },
  {
    id: 'rel-5',
    sourceId: 'task-3',
    targetId: 'task-4',
    relationType: 'canvas_connection',
  }
];

// Activity log seed to feed charts
const DEFAULT_LOGS: ActivityLog[] = [
  // Day -4
  {
    id: 'log-1',
    itemId: 'task-1',
    itemTitle: 'Design Polymorphic Relational Schema',
    itemType: 'task',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'create',
  },
  // Day -3
  {
    id: 'log-2',
    itemId: 'doc-1',
    itemTitle: 'Product Requirements Document',
    itemType: 'document',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'create',
  },
  {
    id: 'log-3',
    itemId: 'task-1',
    itemTitle: 'Design Polymorphic Relational Schema',
    itemType: 'task',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'complete',
  },
  // Day -2
  {
    id: 'log-4',
    itemId: 'event-1',
    itemTitle: 'Architecture Sync Meeting',
    itemType: 'event',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'create',
  },
  // Day -1
  {
    id: 'log-5',
    itemId: 'task-2',
    itemTitle: 'Implement Canvas Engine Drag and Drop',
    itemType: 'task',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'create',
  },
  {
    id: 'log-6',
    itemId: 'doc-2',
    itemTitle: 'Canvas Drag-and-Drop Technical Specs',
    itemType: 'document',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'create',
  },
];

export class DatabaseService {
  private static load<T>(key: string, defaultValue: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private static save<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ITEMS API
  public static getItems(): Item[] {
    return this.load<Item>(STORAGE_KEYS.ITEMS, DEFAULT_ITEMS);
  }

  public static getItem(id: string): Item | undefined {
    return this.getItems().find(item => item.id === id);
  }

  public static createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'> & { id?: string }): Item {
    const items = this.getItems();
    const newItem: Item = {
      ...item,
      id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
      workspaceId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canvasX: item.canvasX ?? Math.floor(Math.random() * 500) + 100,
      canvasY: item.canvasY ?? Math.floor(Math.random() * 500) + 100,
      canvasColor: item.canvasColor ?? this.getRandomColor(item.type),
    };

    items.push(newItem);
    this.save(STORAGE_KEYS.ITEMS, items);

    this.logActivity(newItem.id, newItem.title, newItem.type, 'create');
    return newItem;
  }

  public static updateItem(id: string, updates: Partial<Item>): Item {
    const items = this.getItems();
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error(`Item ${id} not found`);
    }

    const oldItem = items[itemIndex];
    const updatedItem: Item = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[itemIndex] = updatedItem;
    this.save(STORAGE_KEYS.ITEMS, items);

    // If task changes status to done
    if (oldItem.status !== 'done' && updatedItem.status === 'done') {
      this.logActivity(updatedItem.id, updatedItem.title, updatedItem.type, 'complete');
    } else {
      this.logActivity(updatedItem.id, updatedItem.title, updatedItem.type, 'update');
    }

    return updatedItem;
  }

  public static deleteItem(id: string): void {
    const items = this.getItems();
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    const filteredItems = items.filter(item => item.id !== id);
    this.save(STORAGE_KEYS.ITEMS, filteredItems);

    // Relational integrity check: cascade delete any relations linked to this item
    const relations = this.getRelations();
    const filteredRelations = relations.filter(rel => rel.sourceId !== id && rel.targetId !== id);
    this.save(STORAGE_KEYS.RELATIONS, filteredRelations);

    this.logActivity(id, itemToDelete.title, itemToDelete.type, 'delete');
  }

  // RELATIONS API
  public static getRelations(): ItemRelation[] {
    return this.load<ItemRelation>(STORAGE_KEYS.RELATIONS, DEFAULT_RELATIONS);
  }

  public static createRelation(sourceId: string, targetId: string, relationType: RelationType): ItemRelation {
    const relations = this.getRelations();
    
    // Prevent duplicate relations
    const existing = relations.find(
      r => r.sourceId === sourceId && r.targetId === targetId && r.relationType === relationType
    );
    if (existing) return existing;

    const newRelation: ItemRelation = {
      id: `rel-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      relationType,
    };

    relations.push(newRelation);
    this.save(STORAGE_KEYS.RELATIONS, relations);
    return newRelation;
  }

  public static deleteRelation(id: string): void {
    const relations = this.getRelations();
    const filtered = relations.filter(rel => rel.id !== id);
    this.save(STORAGE_KEYS.RELATIONS, filtered);
  }

  public static deleteRelationBetween(sourceId: string, targetId: string): void {
    const relations = this.getRelations();
    const filtered = relations.filter(rel => !(rel.sourceId === sourceId && rel.targetId === targetId));
    this.save(STORAGE_KEYS.RELATIONS, filtered);
  }

  // LOGS API
  public static getActivityLogs(): ActivityLog[] {
    return this.load<ActivityLog>(STORAGE_KEYS.LOGS, DEFAULT_LOGS);
  }

  private static logActivity(itemId: string, itemTitle: string, itemType: ItemType, action: 'create' | 'update' | 'complete' | 'delete'): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemTitle,
      itemType,
      timestamp: new Date().toISOString(),
      action,
    };
    logs.push(newLog);
    this.save(STORAGE_KEYS.LOGS, logs);
  }

  public static getRelatedItems(itemId: string): Item[] {
    const relations = this.getRelations();
    const items = this.getItems();
    
    const targetIds = relations
      .filter(r => r.sourceId === itemId)
      .map(r => r.targetId);
      
    const sourceIds = relations
      .filter(r => r.targetId === itemId)
      .map(r => r.sourceId);

    const relatedIds = Array.from(new Set([...targetIds, ...sourceIds]));
    return items.filter(item => relatedIds.includes(item.id));
  }

  private static getRandomColor(type: ItemType): string {
    const colors: Record<ItemType, string[]> = {
      task: ['#8b5cf6', '#3b82f6', '#10b981', '#eab308'], // Purple, Blue, Green, Yellow
      event: ['#ef4444', '#f97316', '#ec4899'], // Red, Orange, Pink
      document: ['#06b6d4', '#14b8a6', '#6366f1'], // Cyan, Teal, Indigo
      sticky: ['#a8a29e', '#f472b6', '#a7f3d0'], // Warm gray, pink, light green
    };
    const palette = colors[type];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  public static resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.RELATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  }
}
