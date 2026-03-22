import React from 'react';
import { AlertTriangle, Info, Bell } from 'lucide-react';

interface AlertsProps {
  alerts: string[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center gap-4 mb-8">
        <AlertTriangle className="w-10 h-10 text-earth-accent" />
        <h2 className="text-3xl font-extrabold tracking-tight text-earth-primary">Citizen Alerts</h2>
      </div>
      
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-earth-accent/5 border border-earth-accent/10 hover:bg-earth-accent/10 transition-all duration-300"
            >
              <div className="flex gap-4">
                <Info className="w-6 h-6 mt-0.5 shrink-0 text-earth-accent" />
                <p className="text-zinc-700 font-medium leading-relaxed">{alert}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Bell className="w-20 h-20 mb-6 text-zinc-400" />
            <p className="text-zinc-500 italic text-xl">No active alerts. Run simulation to see insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
