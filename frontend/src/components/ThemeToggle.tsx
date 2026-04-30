import { Monitor, Zap } from 'lucide-react';
import { Button } from './ui/SovereignUI';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'tallyprime' ? 'dark' : 'tallyprime');
  };

  return (
    <Button 
      variant="sec" 
      size="sm" 
      onClick={toggleTheme}
      className="gap-3 px-4 py-2 bg-bg-float/40 border-border-subtle hover:bg-accent/10 hover:text-accent transition-all group"
    >
      {theme !== 'tallyprime' ? (
        <>
          <Monitor size={14} className="text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest">TallyPrime Mode</span>
        </>
      ) : (
        <>
          <Zap size={14} className="text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest">Modern Dark</span>
        </>
      )}
    </Button>
  );
};
