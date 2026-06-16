import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item } from '../services/db';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Grid, 
  List, 
  Link2,
  Edit2
} from 'lucide-react';

interface TaskEngineProps {
  onLinkItem: (itemId: string) => void;
}

export const TaskEngine: React.FC<TaskEngineProps> = ({ onLinkItem }) => {
  const [tasks, setTasks] = useState<Item[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Item> | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const allItems = DatabaseService.getItems();
    setTasks(allItems.filter(item => item.type === 'task'));
  };

  const handleCreateOrUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.title?.trim()) return;

    if (editingTask.id) {
      DatabaseService.updateItem(editingTask.id, {
        title: editingTask.title,
        content: editingTask.content || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'todo',
        dueDate: editingTask.dueDate || undefined,
        tags: editingTask.tags || [],
      });
    } else {
      DatabaseService.createItem({
        type: 'task',
        title: editingTask.title,
        content: editingTask.content || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'todo',
        dueDate: editingTask.dueDate || undefined,
        tags: editingTask.tags || [],
      });
    }

    setIsEditorOpen(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task? All of its relationships will be removed.')) {
      DatabaseService.deleteItem(id);
      loadTasks();
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    DatabaseService.updateItem(id, { status: newStatus });
    loadTasks();
  };

  const handleOpenEditor = (task?: Item) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask({
        title: '',
        content: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: [],
      });
    }
    setIsEditorOpen(true);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'low': return '#9ca3af';
      default: return '#9ca3af';
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: '#6b7280' },
    { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ];

  return (
    <div style={{ padding: '30px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Header Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexShrink: 0
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '6px' }}>
            Task Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Organize checklists, block dependencies, and track completion states.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* View Toggle */}
          <div className="glass-panel" style={{ display: 'flex', padding: '3px' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                background: viewMode === 'kanban' ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                color: viewMode === 'kanban' ? '#fff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <Grid size={14} /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <List size={14} /> List
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => handleOpenEditor()}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Main Board View */}
      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          flex: 1,
          alignItems: 'stretch'
        }}>
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'rgba(11, 15, 25, 0.4)',
                  maxHeight: '70vh'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: `2px solid ${col.color}`,
                  paddingBottom: '8px'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {col.title}
                  </h3>
                  <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Scrollable Content */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingRight: '4px'
                }}>
                  {columnTasks.length === 0 ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      border: '1px dashed var(--glass-border)',
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}>
                      No tasks in this column.
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="glass-card" 
                        style={{ 
                          padding: '16px', 
                          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                          position: 'relative'
                        }}
                      >
                        {/* Task Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word', paddingRight: '20px' }}>
                            {task.title}
                          </h4>
                          <span className="badge" style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: getPriorityColor(task.priority),
                            fontSize: '9px',
                            padding: '2px 6px',
                            border: `1px solid ${getPriorityColor(task.priority)}22`
                          }}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', wordBreak: 'break-word' }}>
                          {task.content}
                        </p>

                        {/* Metadata Footer */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          {task.dueDate && (
                            <span style={{ fontSize: '10px', color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? '#ef4444' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.tags && task.tags.map(tag => (
                            <span key={tag} className="badge" style={{ fontSize: '9px', backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons on card */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--glass-border)',
                          paddingTop: '10px',
                          marginTop: '4px'
                        }}>
                          {/* Move Column dropdown simulator */}
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '4px',
                              color: 'var(--text-secondary)',
                              fontSize: '11px',
                              padding: '2px 4px',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => onLinkItem(task.id)}
                              title="Link to other items"
                              style={{ background: 'transparent', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', padding: '2px' }}
                            >
                              <Link2 size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEditor(task)}
                              title="Edit task"
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              title="Delete task"
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '2px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel" style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks found. Click "New Task" to create one.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px' }}>Task Title</th>
                  <th style={{ padding: '12px 8px' }}>Priority</th>
                  <th style={{ padding: '12px 8px' }}>Due Date</th>
                  <th style={{ padding: '12px 8px' }}>Tags</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px 8px' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          color: task.status === 'done' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : 'var(--text-secondary)',
                          fontSize: '12px',
                          padding: '4px 6px',
                          fontWeight: 500
                        }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{task.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '2px' }}>{task.content}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span className="badge" style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        color: getPriorityColor(task.priority),
                        border: `1px solid ${getPriorityColor(task.priority)}33`
                      }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-secondary)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {task.tags && task.tags.map(tag => (
                          <span key={tag} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '9px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => onLinkItem(task.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          <Link2 size={12} /> Link
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleOpenEditor(task)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteTask(task.id)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <form onSubmit={handleCreateOrUpdateTask} className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              {editingTask.id ? 'Edit Task' : 'Create New Task'}
            </h2>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Task Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={editingTask.title || ''}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Enter task name..."
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editingTask.content || ''}
                onChange={(e) => setEditingTask({ ...editingTask, content: e.target.value })}
                placeholder="Describe what needs to be done..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Priority</label>
                <select
                  className="form-select"
                  value={editingTask.priority || 'medium'}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Status</label>
                <select
                  className="form-select"
                  value={editingTask.status || 'todo'}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tags (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={editingTask.tags?.join(', ') || ''}
                onChange={(e) => setEditingTask({ ...editingTask, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="database, documentation"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingTask(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTask.id ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
