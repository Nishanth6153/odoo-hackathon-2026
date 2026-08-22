import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface StatusTransitionProps {
  statusKey: string | number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusTransition: React.FC<StatusTransitionProps> = ({
  statusKey,
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={statusKey}
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98, y: shouldReduceMotion ? 0 : -6 }}
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.3, ease: 'easeOut' }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
