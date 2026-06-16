import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item } from '../services/db';
import { 
  Plus, 
  Trash2, 
  Search, 
  Eye, 
  Edit, 
  FileText, 
  Link2, 
  Save,
  Clock,
  Tag
} from 'lucide-react';

interface DocumentEngineProps {
  onLinkItem: (itemId: string) => void;
}

export const DocumentEngine: React.FC<DocumentEngineProps> = ({ onLinkItem }) => {
  const [documents, setDocuments] = useState<Item[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'edit' | 'preview'>('edit');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Related items to the selected document
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const allItems = DatabaseService.getItems();
    const docs = allItems.filter(item => item.type === 'document');
    setDocuments(docs);
    
    if (docs.length > 0 && !selectedDocId) {
      handleSelectDocument(docs[0].id);
    }
  };

  const handleSelectDocument = (id: string) => {
    const doc = DatabaseService.getItem(id);
    if (doc) {
      setSelectedDocId(id);
      setTitle(doc.title);
      setContent(doc.content);
      setTags(doc.tags || []);
      setSaveStatus('saved');
      setEditMode('preview'); // Default to preview
      
      // Load related items
      const related = DatabaseService.getRelatedItems(id);
      setRelatedItems(related);
    }
  };

  const handleCreateDocument = () => {
    const newDoc = DatabaseService.createItem({
      type: 'document',
      title: 'Untitled Document',
      content: '# Untitled Document\n\nWrite some markdown content here...',
      tags: ['notebook'],
    });
    
    loadDocuments();
    handleSelectDocument(newDoc.id);
    setEditMode('edit');
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document? All associated links will be deleted.')) {
      DatabaseService.deleteItem(id);
      setSelectedDocId(null);
      setRelatedItems([]);
      loadDocuments();
    }
  };

  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setSaveStatus('dirty');
  };

  const handleTitleChange = (newVal: string) => {
    setTitle(newVal);
    setSaveStatus('dirty');
  };

  const handleSaveDocument = () => {
    if (!selectedDocId) return;
    setSaveStatus('saving');
    
    DatabaseService.updateItem(selectedDocId, {
      title,
      content,
      tags
    });
    
    setTimeout(() => {
      setSaveStatus('saved');
      loadDocuments();
      // Reload related items in case of changes
      setRelatedItems(DatabaseService.getRelatedItems(selectedDocId));
    }, 400);
  };

  // Auto-save logic
  useEffect(() => {
    if (saveStatus === 'dirty') {
      const delayDebounceFn = setTimeout(() => {
        handleSaveDocument();
      }, 1500); // Auto save after 1.5 seconds of inactivity

      return () => clearTimeout(delayDebounceFn);
    }
  }, [content, title, tags, saveStatus]);

  // Simple Markdown Parser for Preview Mode
  const renderMarkdown = (text: string) => {
    if (!text) return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty Document</p>;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '20px 0 10px 0', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '18px 0 8px 0' }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '14px 0 6px 0' }}>{line.replace('### ', '')}</h3>;
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return <li key={index} style={{ marginLeft: '20px', marginBottom: '6px', color: 'var(--text-primary)' }}>{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} style={{ marginLeft: '20px', marginBottom: '6px', color: 'var(--text-primary)' }}>{line.replace('* ', '')}</li>;
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return <blockquote key={index} style={{ borderLeft: '4px solid #6366f1', paddingLeft: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '12px 0' }}>{line.replace('> ', '')}</blockquote>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={index} style={{ height: '10px' }} />;
      }
      
      // Default text paragraph
      return <p key={index} style={{ lineHeight: '1.6', marginBottom: '10px', color: 'var(--text-primary)' }}>{line}</p>;
    });
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }} className="animate-fade-in">
      {/* Docs Sidebar */}
      <div style={{
        width: '260px',
        borderRight: '1px solid var(--glass-border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: 'rgba(11, 15, 25, 0.2)'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Notebooks</h2>
            <button 
              onClick={handleCreateDocument}
              title="New Document"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                color: '#fff'
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notes..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', fontSize: '12px', height: '34px' }}
            />
          </div>
        </div>

        {/* Sidebar List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>
              No documents found.
            </div>
          ) : (
            filteredDocs.map(doc => {
              const isSelected = selectedDocId === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: isSelected ? '#818cf8' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: isSelected ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <FileText size={16} style={{ flexShrink: 0, color: isSelected ? '#818cf8' : 'var(--text-muted)' }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{doc.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor / Content Area */}
      {selectedDocId ? (
        <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
          {/* Main workspace editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid var(--glass-border)' }}>
            
            {/* Editor Top Bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: saveStatus === 'saved' ? '#10b981' : saveStatus === 'saving' ? '#3b82f6' : '#eab308'
                }}>
                  {saveStatus === 'saved' ? '● Saved' : saveStatus === 'saving' ? 'Saving...' : '● Edited'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Mode Toggler */}
                <div className="glass-panel" style={{ display: 'flex', padding: '3px' }}>
                  <button
                    onClick={() => setEditMode('edit')}
                    style={{
                      background: editMode === 'edit' ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      color: editMode === 'edit' ? '#fff' : 'var(--text-secondary)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setEditMode('preview')}
                    style={{
                      background: editMode === 'preview' ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      color: editMode === 'preview' ? '#fff' : 'var(--text-secondary)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <Eye size={12} /> Preview
                  </button>
                </div>

                <button 
                  onClick={handleSaveDocument} 
                  disabled={saveStatus === 'saved'}
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px', opacity: saveStatus === 'saved' ? 0.6 : 1 }}
                >
                  <Save size={13} /> Save
                </button>
                
                <button 
                  onClick={() => handleDeleteDocument(selectedDocId)} 
                  className="btn btn-danger" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Document Editor Body */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{
                  fontSize: '28px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  marginBottom: '20px',
                  outline: 'none'
                }}
                placeholder="Enter title..."
              />

              <div style={{
                marginBottom: '16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Add tags comma-separated (e.g. database, planning)"
                  value={tags.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    setTags(parsed);
                    setSaveStatus('dirty');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>

              {editMode === 'edit' ? (
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: 'calc(100% - 100px)',
                    background: 'transparent',
                    border: 'none',
                    color: '#e5e7eb',
                    fontFamily: 'Courier New, Courier, monospace',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: '1.6'
                  }}
                  placeholder="Start writing markdown content..."
                />
              ) : (
                <div style={{ fontSize: '15px', paddingBottom: '40px' }}>
                  {renderMarkdown(content)}
                </div>
              )}
            </div>
          </div>

          {/* Document Relations Side Bar */}
          <div style={{
            width: '240px',
            padding: '24px',
            background: 'rgba(11, 15, 25, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flexShrink: 0
          }}>
            <div>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>
                Linked Entities
              </h3>
              <button 
                onClick={() => onLinkItem(selectedDocId)}
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '6px' }}
              >
                <Link2 size={12} /> Map Relation
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedItems.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                  No items linked to this document yet. Click above to link tasks or events.
                </div>
              ) : (
                relatedItems.map(item => (
                  <div key={item.id} className="glass-card" style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge" style={{
                        fontSize: '9px',
                        backgroundColor: item.type === 'task' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: item.type === 'task' ? '#a78bfa' : '#f87171'
                      }}>
                        {item.type}
                      </span>
                      {item.status && (
                        <span style={{ fontSize: '10px', color: item.status === 'done' ? '#10b981' : '#3b82f6' }}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Clock size={12} />
                <span>Created: {new Date(documents.find(d => d.id === selectedDocId)?.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Select a document from the left notebook panel, or click "+" to create a new one.
        </div>
      )}
    </div>
  );
};
