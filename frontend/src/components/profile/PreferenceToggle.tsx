import React from 'react';
import { Button } from '@/components/ui/button';

interface PreferenceToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  enabled,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={onToggle}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </Button>
    </div>
  );
};

export default PreferenceToggle;