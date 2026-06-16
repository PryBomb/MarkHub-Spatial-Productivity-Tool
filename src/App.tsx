import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TaskEngine } from './components/TaskEngine';
import { EventEngine } from './components/EventEngine';
import { DocumentEngine } from './components/DocumentEngine';
import { CanvasEngine } from './components/CanvasEngine';
import { MetricsEngine } from './components/MetricsEngine';
import { RelationalLinker } from './components/RelationalLinker';

function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeLinkId, setActiveLinkId] = useState<string | null>(null);
  
  // Reload trigger to force children component updates when relations change
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleRelationChanged = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            key={reloadTrigger} 
            onNavigate={setCurrentView} 
            onLinkItem={setActiveLinkId} 
          />
        );
      case 'tasks':
        return (
          <TaskEngine 
            key={reloadTrigger} 
            onLinkItem={setActiveLinkId} 
          />
        );
      case 'events':
        return (
          <EventEngine 
            key={reloadTrigger} 
            onLinkItem={setActiveLinkId} 
          />
        );
      case 'documents':
        return (
          <DocumentEngine 
            key={reloadTrigger} 
            onLinkItem={setActiveLinkId} 
          />
        );
      case 'canvas':
        return (
          <CanvasEngine 
            key={reloadTrigger} 
            onLinkItem={setActiveLinkId} 
          />
        );
      case 'metrics':
        return (
          <MetricsEngine 
            key={reloadTrigger} 
          />
        );
      default:
        return (
          <Dashboard 
            key={reloadTrigger} 
            onNavigate={setCurrentView} 
            onLinkItem={setActiveLinkId} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Panel Viewport */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Global Relational Mapper Modal */}
      {activeLinkId && (
        <RelationalLinker
          itemId={activeLinkId}
          onClose={() => setActiveLinkId(null)}
          onRelationChanged={handleRelationChanged}
        />
      )}
    </div>
  );
}

export default App;
