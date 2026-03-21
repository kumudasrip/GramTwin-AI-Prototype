import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface AlertsProps {
  alerts: string[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-semibold tracking-tight">Citizen Alerts</h2>
      </div>
      
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div 
              key={index}
              className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-sm"
            >
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{alert}</p>
            </div>
          ))
        ) : (
          <p className="text-zinc-500 italic text-center py-8">No active alerts. Run simulation to see insights.</p>
        )}
      </div>
    </div>
  );
};

export default Alerts;
