/** Shared BeUI press timing for tactile card feedback. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;
