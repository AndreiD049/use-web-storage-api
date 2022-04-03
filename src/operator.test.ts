import { stringify } from 'querystring';
import { IUseWebStorageOptions } from '.';
import StorageOperator from './operator';

describe('With string operator', () => {
    const DEFAULT_VAL = 'test';
    const options: IUseWebStorageOptions<string> = {
        key: 'TEST_KEY',
        expiresIn: 1000,
    };

    let operator: StorageOperator<string>;

    beforeEach(() => {
        operator = new StorageOperator(DEFAULT_VAL, options);
    });

    it('Should initilize with correct values', () => {
        // @ts-ignore
        expect(operator.storage).toBe(localStorage);
        // @ts-ignore
        expect(operator.defaultValue).toBe('test');
    });

    it('Should throw an error if invalid storage type provided', () => {
        expect(
            () =>
                new StorageOperator('test', {
                    ...options,
                    // @ts-ignore
                    storageType: 'map',
                })
        ).toThrow(/Storage type.*map.*not supported/);
    });

    it('Should get the default value if not cached', () => {
        expect(operator.getValue()).toBe(DEFAULT_VAL);
    });

    it('Should get the cached value if available', () => {
        operator = new StorageOperator(DEFAULT_VAL, {
            key: options.key,
        });
        localStorage.setItem(options.key, JSON.stringify({
            value: 'Custom',
        }));
        expect(operator.getValue()).toBe('Custom');
    });

    it('Should get the default value if expired', () => {
        operator = new StorageOperator(DEFAULT_VAL, {
            ...options,
            expiresIn: 1000,
        });
        const expires = Date.now();
        localStorage.setItem(options.key, JSON.stringify({
            value: 'Custom',
            expires
        }));
        expect(operator.getValue()).toBe(DEFAULT_VAL);
    });

    it('Should get the cached value if not expired', () => {
        operator = new StorageOperator(DEFAULT_VAL, {
            ...options,
            expiresIn: 1000,
        });
        const expires = Date.now();
        localStorage.setItem(options.key, JSON.stringify({
            value: 'Custom',
            expires: expires + 1000
        }));
        expect(operator.getValue()).toBe('Custom');
    });

    it('Should set value to storage with correct exiration time', () => {
        // @ts-ignore
        Date.now = jest.spyOn(Date, 'now').mockReturnValue(1000);
        operator.setValue('Custom');
        console.log(localStorage.getItem(options.key));
        const result = JSON.parse(localStorage.getItem(options.key)!);
        expect(result.expires).toBe(2000);
        expect(result.value).toBe('Custom');
        expect(operator.getValue()).toBe('Custom');
    });
});

describe('With date operator', () => {
    const defaultValue = new Date('2022-01-01');
    const options: IUseWebStorageOptions<Date> = {
        key: 'DATE',
        serialize: (v) => v.toISOString(),
        deserialize: (v) => new Date(v),
    }

    let operator: StorageOperator<Date>;

    beforeEach(() => {
        operator = new StorageOperator(defaultValue, options);
    });

    it('Should extract default value if nothing is cached', () => {
        expect(operator.getValue()).toEqual(defaultValue);
    });

    it('Should return cached value when provided', () => {
        const newVal = new Date('2022-01-02');
        operator.setValue(newVal);
        expect(operator.getValue()).toEqual(newVal);
    });

    it('Should return the default value if cache expired', () => {
        operator = new StorageOperator(defaultValue, {
            ...options,
            expiresIn: 1000,
        });

        const newVal = new Date('2022-01-02');

        operator.setValue(newVal);

        jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 1001);
        expect(operator.getValue()).toEqual(defaultValue);
    });
});

describe("With session storage", () => {
    type OPTS = {
        check: boolean;
        on: Date;
        val: string;
    };

    const options: IUseWebStorageOptions<OPTS> = {
        key: 'DATE',
        expiresIn: 1000,
        deserialize: (val) => {
            const result = JSON.parse(val);
            result.on = new Date(result.on);
            return result;
        },
        storageType: 'session',
    }

    let operator = new StorageOperator<OPTS>({
            check: true,
            on: new Date('2022-01-10'),
            val: "test",
        }, options);


    beforeEach(() => {
        operator = new StorageOperator({
            check: true,
            on: new Date('2022-01-10'),
            val: "test",
        }, options);
    });

    it("Should get correct initial value", () => {
        expect(operator.getValue()).toHaveProperty('check', true);
        expect(operator.getValue()).toHaveProperty('on', new Date('2022-01-10'));
        expect(operator.getValue()).toHaveProperty('val', 'test');
    });

    it('Should correctly get the cached value', () => {
        operator.setValue({
            check: false,
            on: new Date('2022-04-03'),
            val: 'new',
        });
        expect(operator.getValue()).toEqual({
            check: false,
            on: new Date('2022-04-03'),
            val: 'new',
        });
    });

    it('Should return default value if expired', () => {
        operator.setValue({
            check: false,
            on: new Date('2022-04-03'),
            val: 'new',
        });
        jest.spyOn(Date, 'now').mockReturnValueOnce(Date.now() + 1001);
        expect(operator.getValue()).toEqual({
            check: true,
            on: new Date('2022-01-10'),
            val: "test",
        });
    });
})