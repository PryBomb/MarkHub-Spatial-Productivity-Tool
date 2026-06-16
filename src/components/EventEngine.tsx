import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item } from '../services/db';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Link2,
  Calendar,
  Edit2
} from 'lucide-react';

interface EventEngineProps {
  onLinkItem: (itemId: string) => void;
}

export const EventEngine: React.FC<EventEngineProps> = ({ onLinkItem }) => {
  const [events, setEvents] = useState<Item[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Weekly selection state
  const [weekOffset, setWeekOffset] = useState(0);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Item> | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const allItems = DatabaseService.getItems();
    setEvents(allItems.filter(item => item.type === 'event'));
  };

  // Helper: Get days of the week based on weekOffset
  const getDaysOfWeek = (): Date[] => {
    const startOfWeek = new Date();
    // Adjust to Monday
    const currentDay = startOfWeek.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + distanceToMonday + weekOffset * 7);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysOfWeek();

  const handleCreateOrUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title?.trim() || !editingEvent.startTime || !editingEvent.endTime) return;

    if (editingEvent.id) {
      DatabaseService.updateItem(editingEvent.id, {
        title: editingEvent.title,
        content: editingEvent.content || '',
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        location: editingEvent.location || 'Virtual Sync',
        tags: editingEvent.tags || [],
      });
    } else {
      DatabaseService.createItem({
        type: 'event',
        title: editingEvent.title,
        content: editingEvent.content || '',
        startTime: editingEvent.startTime,
        endTime: editingEvent.endTime,
        location: editingEvent.location || 'Virtual Sync',
        tags: editingEvent.tags || [],
      });
    }

    setIsEditorOpen(false);
    setEditingEvent(null);
    loadEvents();
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event? All associated links will be removed.')) {
      DatabaseService.deleteItem(id);
      loadEvents();
    }
  };

  const handleOpenEditor = (event?: Item) => {
    if (event) {
      setEditingEvent({
        ...event,
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
      });
    } else {
      // Default to today plus 1 hour
      const start = new Date();
      start.setHours(start.getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      setEditingEvent({
        title: '',
        content: '',
        startTime: start.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        location: 'Zoom Sync',
        tags: [],
      });
    }
    setIsEditorOpen(true);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Filter events by selected date
  const selectedDayEvents = events.filter(event => {
    if (!event.startTime) return false;
    const eventDate = new Date(event.startTime);
    return isSameDay(eventDate, selectedDate);
  }).sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

  // Other upcoming events
  const otherUpcomingEvents = events.filter(event => {
    if (!event.startTime) return false;
    const eventDate = new Date(event.startTime);
    return eventDate > new Date() && !isSameDay(eventDate, selectedDate);
  }).sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

  return (
    <div style={{ padding: '30px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexShrink: 0
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '6px' }}>
            Event Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage deadlines, meetings, and project sync milestones.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenEditor()}>
          <Plus size={16} /> Schedule Event
        </button>
      </div>

      {/* Week Day Picker */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
            >
              Today
            </button>
            <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          textAlign: 'center'
        }}>
          {days.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const label = day.toLocaleDateString('default', { weekday: 'short' });
            const dateNum = day.getDate();

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(day)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '1px solid #6366f1' : isToday ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ fontSize: '11px', color: isSelected ? '#a5b4fc' : 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: isSelected ? '#fff' : isToday ? '#6366f1' : 'var(--text-primary)' }}>{dateNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        flex: 1,
        alignItems: 'start'
      }}>
        {/* Selected Day Agenda */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#ef4444' }} /> Agenda for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px dashed var(--glass-border)',
                borderRadius: '8px'
              }}>
                No meetings or deadlines scheduled on this day.
              </div>
            ) : (
              selectedDayEvents.map(event => {
                const startTime = event.startTime ? new Date(event.startTime) : null;
                const endTime = event.endTime ? new Date(event.endTime) : null;
                
                return (
                  <div key={event.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>{event.content}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => onLinkItem(event.id)}
                          title="Link this event to other nodes"
                          className="btn btn-secondary"
                          style={{ padding: '6px' }}
                        >
                          <Link2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditor(event)}
                          title="Edit Event"
                          className="btn btn-secondary"
                          style={{ padding: '6px' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete Event"
                          className="btn btn-secondary"
                          style={{ padding: '6px', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      alignItems: 'center',
                      marginTop: '16px',
                      borderTop: '1px solid rgba(255,255,255,0.03)',
                      paddingTop: '12px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>
                          {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {endTime ? ` - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{event.location || 'Virtual Sync'}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                        {event.tags && event.tags.map(tag => (
                          <span key={tag} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '9px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Other Upcoming Events */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Upcoming Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
            {otherUpcomingEvents.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No other upcoming events in the calendar.
              </div>
            ) : (
              otherUpcomingEvents.map(event => {
                const startTime = event.startTime ? new Date(event.startTime) : null;
                return (
                  <div key={event.id} className="glass-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{event.title}</h4>
                      <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 500, flexShrink: 0 }}>
                        {startTime?.toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>📍 {event.location || 'Virtual'}</span>
                      <span>{startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && editingEvent && (
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
          <form onSubmit={handleCreateOrUpdateEvent} className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              {editingEvent.id ? 'Edit Scheduled Event' : 'Schedule New Event'}
            </h2>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Event Title</label>
              <input
                type="text"
                required
                className="form-input"
                value={editingEvent.title || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                placeholder="Meeting name, kickoff, deadline..."
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editingEvent.content || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, content: e.target.value })}
                placeholder="Agenda, notes, details..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Start Time</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={editingEvent.startTime || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>End Time</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={editingEvent.endTime || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Location / Call Link</label>
              <input
                type="text"
                className="form-input"
                value={editingEvent.location || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                placeholder="Zoom call, Room A, physical address..."
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tags (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                value={editingEvent.tags?.join(', ') || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="sync, database, customer"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingEvent(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingEvent.id ? 'Save Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
