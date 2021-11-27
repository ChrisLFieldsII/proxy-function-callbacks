import isPromise from 'is-promise';

type TargetType = {
  [prop: string | symbol]: any;
};

/**
 * @desc Command passed to `onBefore` or `
 */
export type OnCallbackCmd<Target> = {
  prop: string | symbol;
  target: Target;
};

export type OnErrorCmd<Target> = OnCallbackCmd<Target> & {
  error: unknown;
};

export type OnSuccessCmd<Target> = OnCallbackCmd<Target> & {
  data: unknown;
};

export type GetProxyHandler<Target> = {
  onSuccess?(cmd: OnSuccessCmd<Target>): void;
  onError?(cmd: OnErrorCmd<Target>): void;
  onBefore?(cmd: OnCallbackCmd<Target>): void;
  onAfter?(cmd: OnCallbackCmd<Target>): void;
  target: Target;
};

function noop() {}

export function getFnCbProxy<Target extends TargetType>(
  args: GetProxyHandler<Target>
) {
  const {
    onAfter = noop,
    onBefore = noop,
    onError = noop,
    onSuccess = noop,
    target,
  } = args;

  const proxyHandler = {
    get: function (target: Target, prop: string | symbol) {
      const propType = typeof target[prop];

      if (propType !== 'function') {
        return Reflect.get(target, prop);
      }

      return function () {
        onBefore({
          prop,
          target,
        });

        try {
          const fnResult = Reflect.get(target, prop)(...arguments);

          if (isPromise(fnResult)) {
            // return a wrapped promise and call callbacks
            return new Promise((resolve, reject) => {
              fnResult.then(
                (successValue: unknown) => {
                  onSuccess({
                    data: successValue,
                    prop,
                    target,
                  });

                  onAfter({
                    prop,
                    target,
                  });

                  resolve(successValue);
                },
                (error: unknown) => {
                  onError({ error, prop, target });

                  onAfter({
                    prop,
                    target,
                  });

                  reject(error);
                }
              );
            });
          } else {
            // keep everything sync and call callbacks
            onSuccess({
              data: fnResult,
              prop,
              target,
            });

            onAfter({
              prop,
              target,
            });

            return fnResult;
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
