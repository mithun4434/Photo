import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Flag, Clock, Minimize2, GripHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

export function ActivePhaseFloat() {
  const [phases, setPhases] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const fetchPhases = async () => {
      const { data } = await supabase.from("phases").select("*").order("startDate", { ascending: true });
      if (data) setPhases(data);
    };

    fetchPhases();

    const subs = supabase
      .channel("phases_tracker")
      .on("postgres_changes", { event: "*", schema: "public", table: "phases" }, () => {
        fetchPhases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subs);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activePhases = useMemo(() => phases.filter((p) => p.startDate && p.endDate && currentTime >= p.startDate && currentTime <= p.endDate), [phases, currentTime]);

  if (activePhases.length === 0) return null;

  if (isMinimized) {
    return (
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-xl flex items-center justify-center p-0"
        onClick={() => setIsMinimized(false)}
      >
        <Flag className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-4">
      {activePhases.map((phase) => {
        const totalDays = differenceInDays(new Date(phase.endDate), new Date(phase.startDate)) || 1;
        const passedDays = differenceInDays(new Date(), new Date(phase.startDate));
        const progress = Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
        
        const difference = new Date(phase.endDate).getTime() - currentTime;
        const daysLeft = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
        const hoursLeft = Math.max(0, Math.floor((difference / (1000 * 60 * 60)) % 24));
        const minsLeft = Math.max(0, Math.floor((difference / 1000 / 60) % 60));
        const secsLeft = Math.max(0, Math.floor((difference / 1000) % 60));

        const formattedTime = `${hoursLeft.toString().padStart(2, '0')}:${minsLeft.toString().padStart(2, '0')}:${secsLeft.toString().padStart(2, '0')}`;

        return (
          <motion.div 
            key={phase.id}
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-auto cursor-move"
          >
            <Card className="w-80 shadow-2xl border-primary/20 bg-background/90 backdrop-blur-md overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <CardContent className="p-4 pt-4 space-y-2 relative">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <GripHorizontal className="w-4 h-4 text-muted-foreground/50" />
                  <Button variant="ghost" size="icon" className="w-6 h-6 h-6 p-0 text-muted-foreground hover:bg-neutral-200/50" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}>
                    <Minimize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <h4 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5 pr-8">
                  <Flag className="w-3.5 h-3.5 text-primary" />
                  {phase.name}
                </h4>
                {phase.description && <p className="text-xs text-muted-foreground">{phase.description}</p>}
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
                    {daysLeft > 0 ? `${daysLeft} days left` : "Ending today"}
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm">{formattedTime}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends {formatDistanceToNow(new Date(phase.endDate), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
