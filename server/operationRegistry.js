import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export const normalizeKey = (value) => {
    return String(value).trim();
};

const createRegistry = (baseUrl = import.meta.url) => {
    const filename = fileURLToPath(baseUrl);
    const dirname = path.dirname(filename);
    const classesDir = path.join(dirname, 'classes');
    const classMap = new Map();

    return {
        classesDir,
        classMap,
        resolveClass: (value) => {
            if (value === null || value === undefined) {
                return null;
            }
            const key = normalizeKey(value);
            if (!key) {
                return null;
            }
            return classMap.get(key) ?? null;
        },
        listClasses: () => {
            return Array.from(classMap.values()).map((record) => ({
                name: record.name
            }));
        }
    };
};

const loadFromDisk = async (registry) => {
    const entries = await readdir(registry.classesDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        const modulePath = path.join(registry.classesDir, entry.name);
        const moduleUrl = pathToFileURL(modulePath).href;
        const moduleExports = await import(moduleUrl);

        const ClassCtor = typeof moduleExports.default === 'function'
            ? moduleExports.default
            : null;
        const className = typeof moduleExports.className === 'string'
            ? moduleExports.className
            : ClassCtor?.name;

        if (!className || !ClassCtor) {
            continue;
        }

        const key = normalizeKey(className);
        if (!key) {
            continue;
        }

        registry.classMap.set(key, {
            name: className,
            ClassCtor
        });
    }
};

export const loadRegistry = async (baseUrl = import.meta.url) => {
    const registry = createRegistry(baseUrl);
    await loadFromDisk(registry);
    return registry;
};
