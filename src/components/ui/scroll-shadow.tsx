import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface ScrollShadowProps {
  children: ReactNode;
  className?: string;
  shadowClassName?: string;
}

export function ScrollShadow({ children, className, shadowClassName }: ScrollShadowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    setShowTopShadow(scrollTop > 10);
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 10);
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // Check initial state
    handleScroll();

    // Add scroll listener
    scrollEl.addEventListener("scroll", handleScroll);
    
    // Add resize observer to handle content changes
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Top shadow */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-4 pointer-events-none z-10 transition-opacity duration-200",
          "bg-gradient-to-b from-background to-transparent",
          showTopShadow ? "opacity-100" : "opacity-0",
          shadowClassName
        )}
        aria-hidden="true"
      />

      {/* Scrollable content */}
      <div ref={scrollRef} className="overflow-y-auto h-full">
        {children}
      </div>

      {/* Bottom shadow */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-4 pointer-events-none z-10 transition-opacity duration-200",
          "bg-gradient-to-t from-background to-transparent",
          showBottomShadow ? "opacity-100" : "opacity-0",
          shadowClassName
        )}
        aria-hidden="true"
      />
    </div>
  );
}
