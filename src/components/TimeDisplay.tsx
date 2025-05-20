
import { useEffect, useState } from "react";

interface TimeDisplayProps {
  seconds: number;
  pulsing?: boolean;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const TimeDisplay = ({ 
  seconds, 
  pulsing = false, 
  size = "md",
  showLabels = true
}: TimeDisplayProps) => {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [secs, setSecs] = useState("00");

  useEffect(() => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    
    setHours(h);
    setMinutes(m);
    setSecs(s);
  }, [seconds]);

  const getSize = () => {
    switch (size) {
      case "sm": return "text-xl";
      case "lg": return "text-4xl";
      default: return "text-2xl";
    }
  };

  const labelSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className={`flex items-center justify-center space-x-1 ${pulsing ? "animate-pulse-light" : ""}`}>
      <div className="flex flex-col items-center">
        <span className={`font-mono font-bold ${getSize()}`}>{hours}: </span>
        {showLabels && <span className={`text-muted-foreground ${labelSize}`}>hrs</span>}
      </div>
      {/* <span className={`font-mono font-bold ${getSize()}`}>:</span> */}
      <div className="flex flex-col items-center">
        <span className={`font-mono font-bold ${getSize()}`}>{minutes}: </span>
        {showLabels && <span className={`text-muted-foreground ${labelSize}`}>min</span>}
      </div>
      <div className="flex flex-col items-center">
        <span className={`font-mono font-bold ${getSize()}`}>{secs}</span>
        {showLabels && <span className={`text-muted-foreground ${labelSize}`}>sec</span>}
      </div>
    </div>
  );
};

export default TimeDisplay;
