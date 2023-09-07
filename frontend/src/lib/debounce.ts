type Procedure = (...args: any[]) => void;

export const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number, refractory: number) => {
  let timer: NodeJS.Timeout;
  let refractoryTimer: NodeJS.Timeout;
  let inRefractoryPeriod = false;
  return (...args: Parameters<F>) => {
    if (inRefractoryPeriod) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      inRefractoryPeriod = true;
      refractoryTimer = setTimeout(() => inRefractoryPeriod = false, refractory);
    }, delay);
  };
};
