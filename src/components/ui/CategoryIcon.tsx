import React from 'react';
import { 
  Ruler, 
  Weight, 
  Thermometer, 
  Beaker, 
  Square, 
  Clock, 
  Gauge, 
  Database, 
  Zap, 
  Battery,
  Atom,
  Activity,
  DollarSign,
  Fuel,
  Wifi,
  Lightbulb,
  Droplet,
  Bolt,
  Percent,
  VolumeX,
  Music,
  Radiation,
  Type,
  Settings,
  Calculator
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  className = "", 
  size = 20 
}) => {
  const iconProps = { className, size };
  
  switch (iconName) {
    case 'ruler': return <Ruler {...iconProps} />;
    case 'weight': return <Weight {...iconProps} />;
    case 'thermometer': return <Thermometer {...iconProps} />;
    case 'beaker': return <Beaker {...iconProps} />;
    case 'square': return <Square {...iconProps} />;
    case 'clock': return <Clock {...iconProps} />;
    case 'gauge': return <Gauge {...iconProps} />;
    case 'database': return <Database {...iconProps} />;
    case 'zap': return <Zap {...iconProps} />;
    case 'battery': return <Battery {...iconProps} />;
    case 'atom': return <Atom {...iconProps} />;
    case 'activity': return <Activity {...iconProps} />;
    case 'dollar-sign': return <DollarSign {...iconProps} />;
    case 'fuel': return <Fuel {...iconProps} />;
    case 'wifi': return <Wifi {...iconProps} />;
    case 'lightbulb': return <Lightbulb {...iconProps} />;
    case 'droplet': return <Droplet {...iconProps} />;
    case 'bolt': return <Bolt {...iconProps} />;
    case 'percent': return <Percent {...iconProps} />;
    case 'volume-x': return <VolumeX {...iconProps} />;
    case 'music': return <Music {...iconProps} />;
    case 'radiation': return <Radiation {...iconProps} />;
    case 'type': return <Type {...iconProps} />;
    case 'standard': return <Calculator {...iconProps} />;
    case 'specialized': return <Settings {...iconProps} />;
    default: return <Square {...iconProps} />;
  }
}; 