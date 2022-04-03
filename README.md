# use-web-storage-api
Simple react hook that saves the value to Web Storage

# Install:

```bash
npm i use-web-storage-api
```

# Usage:

By default, the hook looks very similar to `useState`, except that it receives an additional argument, `options`.

Here is the default usage:

```typescript
import useWebStorage from 'use-web-storage-api';

const MyComponent: React.FC = () => {
    const [name, setName] = useWebStorage('Bob', {
        key: 'NAME', // key of the value in local/session storge
    });

    // When button is clicked, the value in storage will change to 'John'
    return (
        <div>
            <h3>{name}</h3>
            <button onClick={() => setName('John')}>Change name</button>
        </div>}
    );
}
```

Options can have following keys:

```ts
export interface IUseWebStorageOptions<T> {
    // The key under which the value will be stored
    key: string;
    // Storage type, default local
    storageType?: 'local' | 'session';
    // Serialization function: default JSON.stringify
    serialize?: (val: T) => string;
    // Deserialization function: default just returns the string or calls JSON.parse for objects
    deserialize?: (val: string) => T;
    // Number of milliseconds to expiration. Default doesn't expire
    expiresIn?: number;
}
```

# Example

If you have a `Date` value to be stored in the localstorage for max 8 hours, it could be achieved like this:

```ts
import useWebStorage from 'use-web-storage-api';

const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;

const MyComponent: React.FC = () => {
    const [date, setDate] = useWebStorage(new Date(), {
        key: 'DATE', 
        serialize: (dt) => dt.toISOString(),
        deserialize: (dtStr) => new Date(dtStr),
        expiresIn: HOUR * 8,
    });

    // When button is clicked, the value in storage will change to 'John'
    return (
        <div>
            <h3>{date.toISOString()}</h3>
            <button onClick={() => setDate(new Date())}>Change name</button>
        </div>}
    );
}
```