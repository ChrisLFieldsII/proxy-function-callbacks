import isPromise from 'is-promise';

type Prop = string | symbol;

type TargetType = {
  [prop: Prop]: any;
};

/**
 * @desc Command passed to callbacks
 */
export type OnCallbackCmd<Target> = {
  prop: Prop;
  target: Target;
};

/**
 * @desc Command passed to `onError` callback
 */
export type OnErrorCmd<Target> = OnCallbackCmd<Target> & {
  error: unknown;
};

/**
 * @desc Command passed to `onSuccess` callback
 */
export type OnSuccessCmd<Target> = OnCallbackCmd<Target> & {
  data: unknown;
};

/**
 * @desc Command to get proxy for `target` object to tap into its function calls with callbacks.
 * If the `target` function is async, the callbacks will be awaited.
 * Be careful as hefty callbacks can make functions slower!
 */
export type GetProxyCmd<Target> = {
  /** @desc Target object for proxy */
  target: Target;
  /** @desc called when target object function successfully returns any value */
  onSuccess?(cmd: OnSuccessCmd<Target>): void | Promise<void>;
  /** @desc called when target object function throws an error */
  onError?(cmd: OnErrorCmd<Target>): void | Promise<void>;
  /** @desc called before the target object function is executed */
  onBefore?(cmd: OnCallbackCmd<Target>): void | Promise<void>;
  /** @desc called after the target object function is executed */
  onAfter?(cmd: OnCallbackCmd<Target>): void | Promise<void>;
};

function noop() {}

/**
 * @desc Get a proxy for a target object that taps into each of the
 * targets function calls with callbacks:
 */
export function getFnCbProxy<Target extends TargetType>(
  cmd: GetProxyCmd<Target>
) {
  const {
    onAfter = noop,
    onBefore = noop,
    onError = noop,
    onSuccess = noop,
    target,
  } = cmd;

  const proxyHandler = {
    get: function (target: Target, prop: Prop) {
      const propType = typeof target[prop];

      if (propType !== 'function') {
        return Reflect.get(target, prop);
      }

      return function () {
        const onBeforeRes = onBefore({
          prop,
          target,
        });

        try {
          const fnRes = Reflect.get(target, prop)(...arguments);

          if (isPromise(fnRes)) {
            // return a wrapped promise and call callbacks
            return new Promise(async (resolve, reject) => {
              try {
                await onBeforeRes;

                const successValue = await fnRes;

                await onSuccess({
                  data: successValue,
                  prop,
                  target,
                });

                await onAfter({
                  prop,
                  target,
                });

                resolve(successValue);
              } catch (error) {
                await onError({ error, prop, target });

                await onAfter({
                  prop,
                  target,
                });

                reject(error);
              }
            });
          } else {
            // keep everything sync and call callbacks
            onSuccess({
              data: fnRes,
              prop,
              target,
            });

            onAfter({
              prop,
              target,
            });

            return fnRes;
          }
        } catch (error) {
          onError({ error, prop, target });

          onAfter({
            prop,
            target,
          });

          throw error;
        }
        // note: not using finally for onAfter since function could be a promise within try/catch
      };
    },
  };

  const proxy = new Proxy(target, proxyHandler);
  return proxy;
}
