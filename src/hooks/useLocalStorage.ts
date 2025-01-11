import { useState, useEffect, useCallback } from 'react';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) as T : initialValue;
        } catch (error) {
            console.error("Failed to read from localStorage", error);
            return initialValue;
        }
    });

    const debouncedValue = useDebounce<T>(storedValue, 500);
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(debouncedValue));
        } catch (error) {
            console.error("Failed to write to localStorage", error);
        }
    }, [key, debouncedValue]);

    const setValue = useCallback((value: T | ((val: T) => T)): void => {
        setStoredValue(previous => typeof value === 'function' ? (value as (val: T) => T)(previous) : value);
    }, []);

    return [storedValue, setValue];
}

export default useLocalStorage;
