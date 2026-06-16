import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/db';
import type { Item, ActivityLog } from '../services/db';
import { 
  TrendingUp, 
  CheckSquare, 
  Layers,
  Award
} from 'lucide-react';

export const MetricsEngine: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(DatabaseService.getItems());
    setLogs(DatabaseService.getActivityLogs());
  };

  // Group items by type
  const tasks = items.filter(i => i.type === 'task');
  const events = items.filter(i => i.type === 'event');
  const documents = items.filter(i => i.type === 'document');
  const stickies = items.filter(i => i.type === 'sticky');

  const totalItemsCount = items.length;

  const getPercentage = (count: number) => {
    return totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0;
  };

  // Tasks status
  const completedTasks = tasks.filter(t => t.status === 'done');
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  // Generate 7-day velocity chart data
  // We look back 7 days from today and count how many tasks were completed on each day
  const getVelocityData = () => {
    const dates: { date: Date; label: string; count: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      
      // Filter logs of type 'complete' on this specific date
      const count = logs.filter(log => {
        if (log.action !== 'complete' && log.action !== 'create') return false; // Count actions
        // Let's count completes for velocity, or general activities
        const logDate = new Date(log.timestamp);
        return logDate.getFullYear() === d.getFullYear() &&
               logDate.getMonth() === d.getMonth() &&
               logDate.getDate() === d.getDate();
      }).length;

      dates.push({ date: d, label, count });
    }
    return dates;
  };

  const velocityData = getVelocityData();
  const maxCount = Math.max(...velocityData.map(d => d.count), 4); // Min ceiling of 4 for chart scaling

  // Calculate focus productivity score
  // E.g., ratio of completed tasks + total documents * 5 + events * 2
  const productivityScore = Math.min(
    Math.round((completedTasks.length * 15) + (documents.length * 10) + (events.length * 5)),
    100
  );

  return (
    <div style={{ padding: '30px', overflowY: 'auto', height: '100%' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '6px' }}>
          Productivity Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Track daily velocity charts, node distributions, and metrics.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Task Completion</span>
              <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{taskCompletionRate}%</h3>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <b>{completedTasks.length}</b> completed of {tasks.length} total tasks.
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Productivity Score</span>
              <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{productivityScore}/100</h3>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Calculated from logs and updates.
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Database Objects</span>
              <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{totalItemsCount}</h3>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>
              <Layers size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Unified relational models in storage.
          </div>
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '32px'
      }}>
        {/* SVG Velocity Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} /> Workspace Velocity (Activity Logged / Day)
          </h3>
          
          {/* Custom SVG Bar Chart */}
          <div style={{ position: 'relative', width: '100%', height: '220px', marginTop: '10px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="var(--text-muted)" fontSize="9" textAnchor="middle">{maxCount}</text>
              <text x="15" y="95" fill="var(--text-muted)" fontSize="9" textAnchor="middle">{Math.round(maxCount/2)}</text>
              <text x="15" y="174" fill="var(--text-muted)" fontSize="9" textAnchor="middle">0</text>

              {/* Bars */}
              {velocityData.map((d, index) => {
                const barWidth = 32;
                const spacing = 58;
                const startX = 55 + index * spacing;
                
                // Height based on percentage of max count
                const heightPercentage = d.count / maxCount;
                const barHeight = Math.max(heightPercentage * 140, 4); // Min height 4px so bar is visible
                const startY = 170 - barHeight;

                return (
                  <g key={index}>
                    {/* Glowing background gradient / hover effect */}
                    <rect
                      x={startX}
                      y={startY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#barGradient)"
                    />
                    {/* Active tooltip number */}
                    <text
                      x={startX + barWidth / 2}
                      y={startY - 6}
                      fill="var(--text-primary)"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {d.count}
                    </text>
                    {/* Day label */}
                    <text
                      x={startX + barWidth / 2}
                      y="188"
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Definitions for gradients */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Item Distribution Segment */}
        <div className="glass-panel" style={{ padding: '24px', height: '100%' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Item Distribution</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Segmented Horizontal Bar */}
            <div style={{
              height: '14px',
              width: '100%',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              <div style={{ width: `${getPercentage(tasks.length)}%`, backgroundColor: '#8b5cf6' }} title="Tasks" />
              <div style={{ width: `${getPercentage(events.length)}%`, backgroundColor: '#ef4444' }} title="Events" />
              <div style={{ width: `${getPercentage(documents.length)}%`, backgroundColor: '#06b6d4' }} title="Documents" />
              <div style={{ width: `${getPercentage(stickies.length)}%`, backgroundColor: '#ec4899' }} title="Stickies" />
            </div>

            {/* Labels breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Tasks</span>
                </span>
                <span style={{ fontWeight: 600 }}>{tasks.length} ({getPercentage(tasks.length)}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Events</span>
                </span>
                <span style={{ fontWeight: 600 }}>{events.length} ({getPercentage(events.length)}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Documents</span>
                </span>
                <span style={{ fontWeight: 600 }}>{documents.length} ({getPercentage(documents.length)}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Stickies</span>
                </span>
                <span style={{ fontWeight: 600 }}>{stickies.length} ({getPercentage(stickies.length)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Database Transactions Log</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 8px' }}>Time</th>
                <th style={{ padding: '10px 8px' }}>Action</th>
                <th style={{ padding: '10px 8px' }}>Model</th>
                <th style={{ padding: '10px 8px' }}>Entity ID / Name</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...logs]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map(log => {
                  let badgeBg = 'rgba(255,255,255,0.05)';
                  let badgeColor = 'var(--text-secondary)';

                  if (log.action === 'create') {
                    badgeBg = 'rgba(59, 130, 246, 0.15)';
                    badgeColor = '#60a5fa';
                  } else if (log.action === 'complete') {
                    badgeBg = 'rgba(16, 185, 129, 0.15)';
                    badgeColor = '#34d399';
                  } else if (log.action === 'update') {
                    badgeBg = 'rgba(230, 180, 10, 0.15)';
                    badgeColor = '#fbbf24';
                  } else if (log.action === 'delete') {
                    badgeBg = 'rgba(239, 68, 68, 0.15)';
                    badgeColor = '#f87171';
                  }

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="badge" style={{ backgroundColor: badgeBg, color: badgeColor, fontSize: '9px' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                        {log.itemType}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {log.itemTitle}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        Success
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
