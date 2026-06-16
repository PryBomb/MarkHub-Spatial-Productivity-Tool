import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item, ItemRelation, RelationType } from '../services/db';
import { Link2, Unlink, Plus, Search, X } from 'lucide-react';

interface RelationalLinkerProps {
  itemId: string;
  onClose: () => void;
  onRelationChanged?: () => void;
}

export const RelationalLinker: React.FC<RelationalLinkerProps> = ({ 
  itemId, 
  onClose, 
  onRelationChanged 
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [relations, setRelations] = useState<ItemRelation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('links_to');

  const currentItem = items.find(item => item.id === itemId);

  useEffect(() => {
    loadData();
  }, [itemId]);

  const loadData = () => {
    setItems(DatabaseService.getItems());
    setRelations(DatabaseService.getRelations());
  };

  // Filter out the current item and any item already directly related
  const currentRelations = relations.filter(
    rel => rel.sourceId === itemId || rel.targetId === itemId
  );

  const relatedItemIds = currentRelations.map(rel => 
    rel.sourceId === itemId ? rel.targetId : rel.sourceId
  );

  const availableItems = items.filter(
    item => item.id !== itemId && !relatedItemIds.includes(item.id)
  );

  const filteredAvailableItems = availableItems.filter(
    item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRelation = () => {
    if (!selectedTargetId) return;
    DatabaseService.createRelation(itemId, selectedTargetId, relationType);
    loadData();
    setSelectedTargetId('');
    if (onRelationChanged) onRelationChanged();
  };

  const handleDeleteRelation = (relId: string) => {
    DatabaseService.deleteRelation(relId);
    loadData();
    if (onRelationChanged) onRelationChanged();
  };

  const getRelationBadgeColor = (type: RelationType) => {
    switch (type) {
      case 'links_to': return '#3b82f6'; // Blue
      case 'blocks': return '#ef4444'; // Red
      case 'parent_of': return '#10b981'; // Green
      case 'canvas_connection': return '#8b5cf6'; // Purple
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link2 size={20} style={{ color: '#818cf8' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Relational Mapper</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Link: <span style={{ color: '#fff', fontWeight: 500 }}>{currentItem?.title || 'Unknown Item'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Existing Relations */}
        <div style={{ marginBottom: '24px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>
            Active Associations ({currentRelations.length})
          </h3>
          <div style={{
            maxHeight: '150px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px'
          }}>
            {currentRelations.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                No active links for this item yet. Use the tool below to link items.
              </div>
            ) : (
              currentRelations.map(rel => {
                const isSource = rel.sourceId === itemId;
                const otherItemId = isSource ? rel.targetId : rel.sourceId;
                const otherItem = items.find(i => i.id === otherItemId);
                
                return (
                  <div key={rel.id} className="glass-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <span className="badge" style={{
                        backgroundColor: getRelationBadgeColor(rel.relationType),
                        color: '#fff',
                        fontSize: '9px',
                        padding: '2px 6px'
                      }}>
                        {rel.relationType.replace('_', ' ')}
                      </span>
                      <span style={{
                        color: 'var(--text-secondary)',
                        fontSize: '11px'
                      }}>
                        {isSource ? '→' : '←'}
                      </span>
                      <span style={{
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}>
                        {otherItem ? otherItem.title : `Deleted Item (${otherItemId})`}
                      </span>
                      <span className="badge" style={{
                        fontSize: '9px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)'
                      }}>
                        {otherItem?.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteRelation(rel.id)}
                      title="Unlink Items"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Unlink size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create Relation Form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>
            Map New Relation
          </h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <select 
                className="form-select"
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as RelationType)}
              >
                <option value="links_to">Links To</option>
                <option value="blocks">Blocks (Dependency)</option>
                <option value="parent_of">Parent Of</option>
                <option value="canvas_connection">Canvas Connection</option>
              </select>
            </div>
            <div style={{ flex: 1.5, position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Search items to link..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid var(--glass-border)',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.2)',
            marginBottom: '16px'
          }}>
            {filteredAvailableItems.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                {searchQuery ? 'No matching items found.' : 'No other items available to link.'}
              </div>
            ) : (
              filteredAvailableItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedTargetId(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: selectedTargetId === item.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTargetId !== item.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTargetId !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', marginRight: '10px' }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: selectedTargetId === item.id ? '#818cf8' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>{item.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="badge" style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    fontSize: '9px',
                    flexShrink: 0
                  }}>
                    {item.type}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '12px',
            flexShrink: 0
          }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!selectedTargetId}
              onClick={handleCreateRelation}
              style={{
                opacity: selectedTargetId ? 1 : 0.5,
                cursor: selectedTargetId ? 'pointer' : 'not-allowed'
              }}
            >
              <Plus size={16} /> Link Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
