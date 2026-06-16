import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item, ActivityLog } from '../services/db';
import { 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Clock, 
  Zap, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onLinkItem: (itemId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLinkItem }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Quick-Add Form States
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState<'task' | 'event' | 'document' | 'sticky'>('task');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(DatabaseService.getItems());
    setLogs(DatabaseService.getActivityLogs());
  };

  // Quick stats
  const tasks = items.filter(i => i.type === 'task');
  const completedTasks = tasks.filter(i => i.status === 'done');
  const pendingTasks = tasks.filter(i => i.status !== 'done');
  const events = items.filter(i => i.type === 'event');
  const docs = items.filter(i => i.type === 'document');

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  // Sorting
  const highPriorityTasks = pendingTasks
    .filter(t => t.priority === 'high')
    .slice(0, 4);

  const upcomingEvents = events
    .filter(e => e.startTime && new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime())
    .slice(0, 3);

  // recentDocs removed as it was unused

  const sortedLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const extraFields: Partial<Item> = {};
    if (quickType === 'task') {
      extraFields.status = 'todo';
      extraFields.priority = 'medium';
      extraFields.dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    } else if (quickType === 'event') {
      extraFields.startTime = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
      extraFields.endTime = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
      extraFields.location = 'Virtual Sync';
    }

    DatabaseService.createItem({
      type: quickType,
      title: quickTitle,
      content: quickType === 'document' ? '# ' + quickTitle : 'Quickly added from Dashboard console.',
      tags: ['quick-add'],
      ...extraFields
    });

    setQuickTitle('');
    loadData();
  };

  const handleToggleTask = (task: Item) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    DatabaseService.updateItem(task.id, { status: newStatus });
    loadData();
  };

  return (
    <div style={{ padding: '30px', overflowY: 'auto', height: '100%' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '6px' }}>
          Workspace Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Welcome back! Here is a live relational view of your notes, calendar, and task velocity.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}>
            <CheckCircle2 size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Tasks Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>{pendingTasks.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
            <Calendar size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Events Scheduled</div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>{events.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', flexShrink: 0 }}>
            <FileText size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Documents</div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>{docs.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
            <TrendingUp size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Velocity Score</div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Quick Console Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '32px'
      }}>
        {/* Quick Add Bar */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: '#eab308' }} /> Unified Relational Console
          </h2>
          <form onSubmit={handleQuickAdd} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Type title (e.g. Design relational schema model)..."
                className="form-input"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                style={{ height: '42px' }}
              />
            </div>
            <div style={{ width: '130px' }}>
              <select
                className="form-select"
                value={quickType}
                onChange={(e) => setQuickType(e.target.value as any)}
                style={{ height: '42px' }}
              >
                <option value="task">as Task</option>
                <option value="event">as Event</option>
                <option value="document">as Document</option>
                <option value="sticky">as Sticky Node</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              <Plus size={16} /> Add Item
            </button>
          </form>
        </div>

        {/* Small Navigation helper */}
        <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>Need full canvas view?</div>
          <button 
            onClick={() => onNavigate('canvas')} 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
          >
            Open Interactive Board <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Core Widgets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* High Priority Tasks */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>High Priority Actions</h3>
            <button 
              onClick={() => onNavigate('tasks')} 
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
            >
              View Board
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {highPriorityTasks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0' }}>No pending high priority tasks!</div>
            ) : (
              highPriorityTasks.map(task => (
                <div key={task.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => handleToggleTask(task)}
                    style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {task.content}
                    </div>
                    {task.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#ef4444', marginTop: '6px' }}>
                        <Clock size={10} />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => onLinkItem(task.id)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', fontSize: '10px', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Link
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schedule Feed */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Upcoming Events</h3>
            <button 
              onClick={() => onNavigate('events')} 
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
            >
              View Schedule
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0' }}>No upcoming events scheduled.</div>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="glass-card" style={{ padding: '12px 16px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {event.startTime ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{event.content}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {event.location || 'Virtual'}</span>
                    <button 
                      onClick={() => onLinkItem(event.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', fontSize: '10px', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Link
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Audit Stream (Relations)</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {sortedLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No activity logged.</div>
            ) : (
              sortedLogs.map(log => {
                let actionLabel = '';
                let actionColor = 'var(--text-secondary)';
                switch (log.action) {
                  case 'create':
                    actionLabel = 'created';
                    actionColor = '#60a5fa'; // Blue
                    break;
                  case 'complete':
                    actionLabel = 'completed';
                    actionColor = '#34d399'; // Green
                    break;
                  case 'update':
                    actionLabel = 'updated';
                    actionColor = '#fbbf24'; // Yellow
                    break;
                  case 'delete':
                    actionLabel = 'deleted';
                    actionColor = '#f87171'; // Red
                    break;
                }

                return (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: actionColor,
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <span style={{ color: actionColor, fontWeight: 600 }}>{actionLabel}</span>{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>[{log.itemType}]</span>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.itemTitle}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
