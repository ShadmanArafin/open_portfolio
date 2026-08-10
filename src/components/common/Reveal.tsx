'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  duration?: number;
  type?: 'fade-up' | 'clip-headline' | 'scale-image' | 'label';
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  width = '100%',
  delay = 0,
  duration = 0.7,
  type = 'fade-up',
  className = '',
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px' });

  if (type === 'clip-headline') {
    return (
      <div ref={ref} className={`overflow-hidden py-1.5 -my-1.5 ${className}`} style={{ width }}>
        <motion.div
          initial={{ y: '110%', opacity: 0 }}
          animate={isInView ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
          transition={{
            duration: duration,
            delay: delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  if (type === 'scale-image') {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`} style={{ width }}>
        <motion.div
          initial={{ scale: 1.04, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 1.04, opacity: 0 }}
          transition={{
            duration: duration + 0.1,
            delay: delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  if (type === 'label') {
    return (
      <div ref={ref} className={className} style={{ width }}>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
          transition={{
            duration: 0.5,
            delay: delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // Default: fade-up
  return (
    <div ref={ref} className={className} style={{ width }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
