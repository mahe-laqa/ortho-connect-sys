export const devError = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.error(...args);
};

export const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args);
};
