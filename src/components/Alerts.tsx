import React from 'react';
import { AlertTriangle, Info, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AlertsProps {
  alerts: string[];
}

const getAlertType = (alert: string): 'warning' | 'info' | 'success' => {
  const lowerAlert = alert.toLowerCase();
  if (lowerAlert.includes('shortage') || lowerAlert.includes('critical') || lowerAlert.includes('reduce')) {
    return 'warning';
  }
  if (lowerAlert.includes('sustainable') || lowerAlert.includes('welcome')) {
    return 'success';
  }
  return 'info';
};

const getAlertIcon = (type: 'warning' | 'info' | 'success') => {
  switch (type) {
    case 'warning':
      return AlertTriangle;
    case 'success':
      return CheckCircle;
    default:
      return Info;
  }
};

const getAlertStyles = (type: 'warning' | 'info' | 'success') => {
  switch (type) {
    case 'warning':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
        iconColor: 'text-red-600'
      };
    case 'success':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
        iconColor: 'text-green-600'
      };
    default:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
        iconColor: 'text-blue-600'
      };
  }
};

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-card h-full">
      <div className="flex items-center gap-4 mb-8">
        <AlertTriangle className="w-10 h-10 text-earth-accent" />
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-earth-primary">{t('alerts.title')}</h2>
          <p className="text-xs text-zinc-500 mt-1">{alerts.length} {t('alerts.alertCount')}{alerts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => {
            const alertType = getAlertType(alert);
            const styles = getAlertStyles(alertType);
            const IconComponent = getAlertIcon(alertType);
            
            return (
              <div 
                key={index}
                className={`p-6 rounded-2xl border transition-all duration-300 ${styles.bg} ${styles.border} ${styles.hover}`}
              >
                <div className="flex gap-4">
                  <IconComponent className={`w-6 h-6 mt-0.5 shrink-0 ${styles.iconColor}`} />
                  <div className="flex-1">
                    <p className="text-zinc-700 font-medium leading-relaxed">{alert}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Bell className="w-20 h-20 mb-6 text-zinc-400" />
            <p className="text-zinc-500 italic text-xl">{t('alerts.noAlerts')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
