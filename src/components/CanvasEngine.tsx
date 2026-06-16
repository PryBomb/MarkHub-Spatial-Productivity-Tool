import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '../services/db';
import type { Item, ItemRelation } from '../services/db';
import { 
  Trash2, 
  Link2, 
  CheckCircle, 
  FileText, 
  Calendar, 
  FileSignature,
  RefreshCw
} from 'lucide-react';

interface CanvasEngineProps {
  onLinkItem: (itemId: string) => void;
}

export const CanvasEngine: React.FC<CanvasEngineProps> = ({ onLinkItem }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [relations, setRelations] = useState<ItemRelation[]>([]);
  
  // Canvas offset panning states
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging a specific node states
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeOriginalPos, setNodeOriginalPos] = useState({ x: 0, y: 0 });

  // Connection/Linker states
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(DatabaseService.getItems());
    setRelations(DatabaseService.getRelations());
  };

  // Canvas Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking the background canvas wrapper, not cards
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const newX = nodeOriginalPos.x + dx;
      const newY = nodeOriginalPos.y + dy;

      setItems(prev => prev.map(item => {
        if (item.id === draggedNodeId) {
          return { ...item, canvasX: newX, canvasY: newY };
        }
        return item;
      }));
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    } else if (draggedNodeId) {
      // Find the dragged node and persist coordinates to db
      const draggedNode = items.find(item => item.id === draggedNodeId);
      if (draggedNode && draggedNode.canvasX !== undefined && draggedNode.canvasY !== undefined) {
        DatabaseService.updateItem(draggedNodeId, {
          canvasX: Math.round(draggedNode.canvasX),
          canvasY: Math.round(draggedNode.canvasY)
        });
      }
      setDraggedNodeId(null);
    }
  };

  // Node Drag Handlers
  const handleNodeDragStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setDraggedNodeId(itemId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setNodeOriginalPos({ 
      x: item.canvasX ?? 100, 
      y: item.canvasY ?? 100 
    });
  };

  // Double click to create sticky note
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-grid-bg')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate clicked coordinates relative to canvas pan
      const clickX = e.clientX - rect.left - panOffset.x;
      const clickY = e.clientY - rect.top - panOffset.y;

      const titlePrompt = prompt('Enter text for new Board Sticky Note:');
      if (titlePrompt) {
        DatabaseService.createItem({
          type: 'sticky',
          title: titlePrompt,
          content: 'Double click to edit details.',
          canvasX: Math.round(clickX),
          canvasY: Math.round(clickY),
          tags: ['canvas-sticky']
        });
        loadData();
      }
    }
  };

  const handleCreateNode = (type: 'task' | 'event' | 'document' | 'sticky') => {
    const title = prompt(`Enter title for new ${type}:`);
    if (!title) return;

    const x = 100 - panOffset.x;
    const y = 100 - panOffset.y;

    const extraFields: Partial<Item> = {};
    if (type === 'task') {
      extraFields.status = 'todo';
      extraFields.priority = 'medium';
    } else if (type === 'event') {
      extraFields.startTime = new Date().toISOString();
      extraFields.endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }

    DatabaseService.createItem({
      type,
      title,
      content: `A new ${type} created directly on the whiteboard canvas.`,
      canvasX: x,
      canvasY: y,
      tags: ['whiteboard'],
      ...extraFields
    });
    loadData();
  };

  const handleDeleteNode = (id: string) => {
    if (confirm('Delete this whiteboard item?')) {
      DatabaseService.deleteItem(id);
      loadData();
    }
  };

  // Connection trigger
  const handleToggleLinking = (id: string) => {
    if (linkingSourceId === null) {
      setLinkingSourceId(id);
    } else if (linkingSourceId === id) {
      setLinkingSourceId(null);
    } else {
      // Connect visual arrow
      DatabaseService.createRelation(linkingSourceId, id, 'canvas_connection');
      setLinkingSourceId(null);
      loadData();
    }
  };

  const handleToggleTaskStatus = (task: Item) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    DatabaseService.updateItem(task.id, { status: newStatus });
    loadData();
  };

  const getRelationLines = () => {
    return relations.map(rel => {
      const source = items.find(i => i.id === rel.sourceId);
      const target = items.find(i => i.id === rel.targetId);

      if (!source || !target) return null;

      // Center offset approx. Card dimensions: min-width: 220px, height: approx 120px
      const x1 = (source.canvasX ?? 0) + 110 + panOffset.x;
      const y1 = (source.canvasY ?? 0) + 60 + panOffset.y;
      const x2 = (target.canvasX ?? 0) + 110 + panOffset.x;
      const y2 = (target.canvasY ?? 0) + 60 + panOffset.y;

      let strokeColor = 'rgba(255, 255, 255, 0.2)';
      let isDashed = false;

      if (rel.relationType === 'canvas_connection') {
        strokeColor = '#a855f7'; // Purple line
        isDashed = true;
      } else if (rel.relationType === 'links_to') {
        strokeColor = '#3b82f6'; // Blue line
      } else if (rel.relationType === 'blocks') {
        strokeColor = '#ef4444'; // Red blocking line
      }

      return (
        <g key={rel.id}>
          <line 
            x1={x1} 
            y1={y1} 
            x2={x2} 
            y2={y2} 
            stroke={strokeColor} 
            strokeWidth="2"
            strokeDasharray={isDashed ? "5,5" : undefined}
          />
          {/* Small mid-point icon indicator */}
          <circle cx={(x1+x2)/2} cy={(y1+y2)/2} r="4" fill={strokeColor} />
        </g>
      );
    }).filter(Boolean);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }} className="animate-fade-in">
      {/* Canvas Top Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(11, 15, 25, 0.5)',
        flexShrink: 0
      }}>
        <div>
          <h1 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Canvas Engine</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Infinite visual whiteboard. Double-click canvas to spawn Stickies. Drag to reposition.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {linkingSourceId && (
            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', animation: 'pulse 1.5s infinite' }}>
              Connection Mode Active: Click target card to link
            </span>
          )}

          <div style={{ display: 'flex', gap: '4px' }} className="glass-panel">
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCreateNode('sticky')}>+ Sticky</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCreateNode('task')}>+ Task</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCreateNode('event')}>+ Event</button>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCreateNode('document')}>+ Doc</button>
          </div>

          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => { setPanOffset({ x: 0, y: 0 }); loadData(); }} title="Reset View">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Infinite Canvas Window */}
      <div 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="canvas-wrapper"
        style={{
          flex: 1,
          position: 'relative',
          userSelect: 'none'
        }}
      >
        {/* Invisible Grid background that pans with offset */}
        <div className="canvas-grid-bg" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
        }} />

        {/* SVG connection lines */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {getRelationLines()}
        </svg>

        {/* Floating Cards (Nodes) */}
        {items.map(item => {
          const posX = (item.canvasX ?? 100) + panOffset.x;
          const posY = (item.canvasY ?? 100) + panOffset.y;
          
          let cardBorderColor = '#9ca3af';
          let icon = <FileText size={16} />;
          
          if (item.type === 'task') {
            cardBorderColor = '#8b5cf6';
            icon = <CheckCircle size={16} style={{ color: '#8b5cf6' }} />;
          } else if (item.type === 'event') {
            cardBorderColor = '#ef4444';
            icon = <Calendar size={16} style={{ color: '#ef4444' }} />;
          } else if (item.type === 'document') {
            cardBorderColor = '#06b6d4';
            icon = <FileText size={16} style={{ color: '#06b6d4' }} />;
          } else if (item.type === 'sticky') {
            cardBorderColor = '#ec4899';
            icon = <FileSignature size={16} style={{ color: '#ec4899' }} />;
          }

          const isCurrentlyLinking = linkingSourceId === item.id;

          return (
            <div
              key={item.id}
              className="canvas-node glass-panel"
              style={{
                left: `${posX}px`,
                top: `${posY}px`,
                borderTop: `4px solid ${item.canvasColor || cardBorderColor}`,
                cursor: draggedNodeId === item.id ? 'grabbing' : 'grab',
                borderColor: isCurrentlyLinking ? '#fff' : 'rgba(255,255,255,0.08)',
                boxShadow: isCurrentlyLinking ? '0 0 15px rgba(255,255,255,0.4)' : '0 4px 20px rgba(0, 0, 0, 0.4)'
              }}
              onMouseDown={(e) => handleNodeDragStart(e, item.id)}
            >
              {/* Card Title Node Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'move' }}>
                {icon}
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {item.type}
                </span>
                
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNode(item.id); }}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '2px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Editable input directly on canvas */}
              <input
                type="text"
                value={item.title}
                onMouseDown={(e) => e.stopPropagation()} // Don't trigger drag on typing
                onChange={(e) => {
                  DatabaseService.updateItem(item.id, { title: e.target.value });
                  loadData();
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  marginBottom: '6px'
                }}
              />

              {/* Item Content details */}
              <textarea
                value={item.content}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => {
                  DatabaseService.updateItem(item.id, { content: e.target.value });
                  loadData();
                }}
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  width: '100%',
                  height: '48px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: '1.4'
                }}
              />

              {/* Task checkboxes directly in Canvas card */}
              {item.type === 'task' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={item.status === 'done'}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={() => handleToggleTaskStatus(item)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Status: <b>{item.status}</b></span>
                </div>
              )}

              {/* Event times directly in canvas card */}
              {item.type === 'event' && item.startTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>📅 {new Date(item.startTime).toLocaleDateString()} at {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {/* Node Card Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '8px',
                marginTop: '10px'
              }}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleToggleLinking(item.id)}
                  style={{
                    background: isCurrentlyLinking ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    color: isCurrentlyLinking ? '#818cf8' : 'var(--text-secondary)',
                    fontSize: '10px',
                    padding: '2px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Link2 size={10} /> Connect
                </button>

                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onLinkItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Relational Links
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
