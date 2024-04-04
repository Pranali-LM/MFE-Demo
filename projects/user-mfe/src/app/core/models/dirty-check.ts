import { combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime, finalize, map, shareReplay, startWith } from 'rxjs/operators';

export interface DirtyComponent {
  isDirty$: Observable<boolean>;
}

function getObjectDiff(obj1 = {}, obj2 = {}) {
  return Object.entries(obj2)
    .filter(([key, value]) => obj1[key] !== value)
    .map(([key, newValue]) => {
      const oldValue = obj1[key];
      if (typeof newValue !== 'object' || typeof newValue !== typeof oldValue) {
        return { [key]: newValue };
      }

      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        const newItems = newValue.filter((i) => !oldValue.includes(i));
        const removedItems = oldValue.filter((i) => !newValue.includes(i));
        if (newItems.length || removedItems.length) {
          return {
            [key]: {
              added: newItems,
              removed: removedItems,
            },
          };
        }
        return {};
      }

      const nestedChangedValue = getObjectDiff(oldValue, newValue);
      if (Object.keys(nestedChangedValue).length) {
        return { [key]: nestedChangedValue };
      }
      return {};
    })
    .filter((o) => !!Object.keys(o).length)
    .reduce((a, b) => ({ ...a, ...b }), {});
}

function isEqual(a: { [key: string]: any }, b: { [key: string]: any }): boolean {
  const objectDiff = getObjectDiff(a, b);
  const noOfKeysChanged = Object.keys(objectDiff).length;
  return !noOfKeysChanged;
}

/**
 * Check whether two observable objects are same or not
 *
 * Also handles browsers beforeunload event and returns false
 * and do preventDefault if two objects are not same so that browser can disaply unsaved changes dialog.
 *
 * Call isEqual function to do deep Checking
 */
export function dirtyCheck<U>(source: Observable<U>) {
  let subscription: Subscription;
  let isDirty = false;
  return <T>(valueChanges: Observable<T>): Observable<boolean> => {
    // eslint-disable-next-line
    const isDirty$: Observable<boolean> = combineLatest(source, valueChanges).pipe(
      debounceTime(300),
      map(([a, b]) => {
        return (isDirty = !isEqual(a, b));
      }),
      finalize(() => subscription.unsubscribe()),
      startWith(false),
      shareReplay(1)
      // shareReplay({ bufferSize: 1, refCount: true }),
    );

    subscription = fromEvent(window, 'beforeunload').subscribe((event) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isDirty && (event.returnValue = false) && event.preventDefault();
    });

    return isDirty$;
  };
}

/**
 * Get the asymmetric difference between two arrays having primitive elements
 *
 * Returns an array containing all the elements of arr1 that are not in arr2 and vice-versa
 * For Eg.,
 * arr1 = [1,2,3]
 * arr2 = [1,3,4]
 * output = [2,4]
 *
 */
export function asymmetricArrayDiff<T extends String | Number | Boolean>(arr1: T[], arr2: T[]): T[] {
  arr1 = arr1 || [];
  arr2 = arr2 || [];

  const diff = arr1.filter((x) => !arr2.includes(x)).concat(arr2.filter((x) => !arr1.includes(x)));
  return diff;
}
