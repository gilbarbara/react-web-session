import { DependencyList, EffectCallback, useEffect, useRef } from 'react';
import * as isDeepEqualReact from 'fast-deep-equal/react';

export function useDeepCompareEffect<T extends DependencyList>(effect: EffectCallback, deps: T) {
  const ref = useRef<T | undefined>(undefined);

  /* istanbul ignore else */
  if (!ref.current || !isDeepEqualReact(deps, ref.current)) {
    ref.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, ref.current);
}
