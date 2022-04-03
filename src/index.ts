import { useEffect, useMemo, useState } from 'react';
import StorageOperator from './operator';

export interface IUseWebStorageOptions<T> {
    // The key under which the value will be stored
    key: string;
    // Storage type, default local
    storageType?: 'local' | 'session';
    // Serialization function: default JSON.stringify
    serialize?: (val: T) => string;
    // Deserialization function: default just returns the string
    deserialize?: (val: string) => T;
    // Number of milliseconds to expiration. Default doesn't expire
    expiresIn?: number;
}

const useWebStorage = <T>(
    defaultVal: T,
    options: IUseWebStorageOptions<T>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const operator = new StorageOperator(defaultVal, options);
    const [value, setValue] = useState<T>(operator.getValue());

    useEffect(() => {
        operator.setValue(value);
    }, [value]);

    return [value, setValue];
};

export default useWebStorage;
