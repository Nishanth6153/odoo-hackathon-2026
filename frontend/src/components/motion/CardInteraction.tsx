import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CardInteractionProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverScale?: number;
  hoverY?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CardInteraction: React.FC<CardInteractionProps> = ({
  children,
  onClick,
  hoverScale = 1.01,
  hoverY = -3,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: hoverY,
              scale: hoverScale,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
};
