// Animation Timing Constants and Configuration
// Use these to fine-tune the animation sequence

export const ANIMATION_CONFIG = {
  // Phase durations (in milliseconds)
  VIBRATE_DURATION: 400,      // 0.4s - Initial shake/vibration
  SCANNER_DURATION: 800,      // 0.8s - Blue light beam traversal
  PULSE_DURATION: 1800,       // 1.8s - Orange dot pulse (3 cycles)
  COMPLETION_DELAY: 200,      // 0.2s - Final phase
  
  // Total sequence duration (approximately 3.8 seconds)
  TOTAL_DURATION: 3200,       // Before finalization
  
  // Vibration parameters
  VIBRATE_AMPLITUDE: 3,       // Pixels of lateral movement
  VIBRATE_FREQUENCY: 8,       // Number of oscillations
  
  // Scanner beam parameters
  SCANNER_BLUR: 8,           // Blur effect in pixels
  SCANNER_GLOW_SIZE: 30,     // Glow effect size
  SCANNER_COLOR: 'rgba(100, 200, 255, 0.8)', // Cool blue
  
  // Pulse parameters
  PULSE_CYCLES: 3,           // Number of pulse repetitions
  PULSE_MIN_OPACITY: 0.3,    // Minimum brightness
  PULSE_MAX_OPACITY: 1,      // Maximum brightness
  
  // Color scheme
  BACKGROUND_COLOR: '#2F353B',    // Deep charcoal grey
  TEXT_COLOR: '#F4F4F4',           // Light grey
  ACCENT_COLOR: '#FF6600',         // Vibrant orange
  ACCENT_COLOR_LIGHT: '#FF8533',   // Light orange
};

export const PHASE_SEQUENCE = [
  { name: 'vibrate' as const, duration: ANIMATION_CONFIG.VIBRATE_DURATION },
  { name: 'scan' as const, duration: ANIMATION_CONFIG.SCANNER_DURATION },
  { name: 'pulse' as const, duration: ANIMATION_CONFIG.PULSE_DURATION },
  { name: 'complete' as const, duration: ANIMATION_CONFIG.COMPLETION_DELAY },
];
