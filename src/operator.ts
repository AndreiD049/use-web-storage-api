import { IUseWebStorageOptions } from '.';

const defaultSerialize = <T>(val: T) => typeof val === 'string' ? val : JSON.stringify(val);
const defaultDeserialize = <T>(defaultVal: T) => (val: string) => {
    if (typeof defaultVal === 'string') return val;
    else return JSON.parse(val);
};

interface ICached {
    value: string,
    expires?: number,
}

export default class StorageOperator<T> {
    private storage: Storage = localStorage;
    private key: string;
    private serialize: NonNullable<IUseWebStorageOptions<T>["serialize"]>;
    private deserialize: NonNullable<IUseWebStorageOptions<T>["deserialize"]>;
    private expiresIn: NonNullable<IUseWebStorageOptions<T>["expiresIn"]>;

    constructor(private defaultValue: T, private options: IUseWebStorageOptions<T>) {
        this.key = options.key;
        this.serialize = options.serialize || defaultSerialize;
        this.deserialize = options.deserialize || defaultDeserialize(defaultValue);
        this.expiresIn = options.expiresIn || -1;
        this.getDefaultStorage();
    }

    getValue(): T {
        try {
            const cached = this.storage.getItem(this.options.key);
            if (cached) {
                const parsed: ICached = JSON.parse(cached);
                if (!this.isExpired(parsed)) {
                    return this.deserialize(parsed.value);
                }
            }
            this.setValue(this.defaultValue);
            return this.defaultValue;
        } catch {
            return this.defaultValue;
        }
    }

    setValue(val: T) {
        const cachedVal: ICached = {
            value: this.serialize(val),
        };
        if (this.isExpiring()) {
            cachedVal.expires = Date.now() + this.expiresIn;
        }
        this.storage.setItem(this.key, JSON.stringify(cachedVal));
    }

    private isExpired(cached: ICached): boolean {
        if (!this.isExpiring()) {
            return false;
        }
        if (typeof cached.expires === 'number') {
            return Date.now() >= cached.expires;
        }
        return true;
    }

    private isExpiring(): boolean {
        return this.expiresIn > 0;
    }

    private getDefaultStorage() {
        if (this.options.storageType === 'local' || this.options.storageType === undefined) {
            this.storage = localStorage;
        } else if (this.options.storageType === 'session') {
            this.storage = sessionStorage;
        } else {
            throw Error(`Storage type '${this.options.storageType}' is not supported`);
        }
    }
}
