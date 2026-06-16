import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  FileText, 
  LayoutGrid, 
  BarChart3, 
  Database,
  User
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', name: 'Task Engine', icon: CheckSquare },
    { id: 'events', name: 'Event Engine', icon: Calendar },
    { id: 'documents', name: 'Document Engine', icon: FileText },
    { id: 'canvas', name: 'Canvas Engine', icon: LayoutGrid },
    { id: 'metrics', name: 'Metrics Engine', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Database size={18} />
        </div>
        <div>
          <h1 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            background: 'linear-gradient(to right, #fff, #9ca3af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>MarkHub</h1>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Relational DB v1.0</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#818cf8' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--glass-border)'
        }}>
          <User size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Workspace Admin</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>workspace@markhub.io</div>
        </div>
      </div>
    </aside>
  );
};
