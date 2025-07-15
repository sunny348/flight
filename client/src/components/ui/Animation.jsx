import React from "react";
import { motion } from "framer-motion";

// Fade in animation
export const FadeIn = ({ children, delay = 0, duration = 0.5, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Slide up animation
export const SlideUp = ({
  children,
  delay = 0,
  duration = 0.5,
  distance = 50,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: distance }}
      transition={{ duration, delay }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Slide in from left animation
export const SlideInLeft = ({
  children,
  delay = 0,
  duration = 0.5,
  distance = 50,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -distance }}
      transition={{ duration, delay }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Slide in from right animation
export const SlideInRight = ({
  children,
  delay = 0,
  duration = 0.5,
  distance = 50,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: distance }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: distance }}
      transition={{ duration, delay }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Scale animation
export const Scale = ({ children, delay = 0, duration = 0.5, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration, delay }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Staggered list animation - use on parent container
export const StaggerContainer = ({
  children,
  delay = 0,
  staggerChildren = 0.1,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerChildren,
          },
        },
        exit: {
          opacity: 0,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Staggered list item animation - use on child elements
export const StaggerItem = ({ children, ...props }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      }}
      transition={{ duration: 0.4 }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Hero section reveal animation
export const HeroReveal = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Hover animation for interactive elements
export const HoverScale = ({ children, scale = 1.05, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}>
      {children}
    </motion.div>
  );
};

// Pulse animation for attention
export const Pulse = ({ children, ...props }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 rgba(51, 102, 255, 0)",
          "0 0 0 10px rgba(51, 102, 255, 0.3)",
          "0 0 0 0 rgba(51, 102, 255, 0)",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
      }}
      {...props}>
      {children}
    </motion.div>
  );
};

export default {
  FadeIn,
  SlideUp,
  SlideInLeft,
  SlideInRight,
  Scale,
  StaggerContainer,
  StaggerItem,
  HeroReveal,
  HoverScale,
  Pulse,
};
