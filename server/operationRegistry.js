import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const operationsDir = path.join(__dirname, 'operations');

const normalizeKey = (value) => String(value).trim().toLowerCase();

const safeNormalizeList = (values) => values
    .map((value) => normalizeKey(value))
    .filter((value) => value.length > 0);

export const loadOperations = async () => {
    const entries = await readdir(operationsDir, { withFileTypes: true });
    const operationsMap = new Map();
    const operationsById = new Map();

    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        const modulePath = path.join(operationsDir, entry.name);
        const moduleUrl = pathToFileURL(modulePath).href;
        const moduleExports = await import(moduleUrl);

        const id = typeof moduleExports.id === 'string'
            ? normalizeKey(moduleExports.id)
            : null;
        const execute = typeof moduleExports.execute === 'function'
            ? moduleExports.execute
            : null;
        const message = typeof moduleExports.message === 'string'
            ? moduleExports.message
            : '';
        const aliases = Array.isArray(moduleExports.aliases)
            ? safeNormalizeList(moduleExports.aliases)
            : [];

        if (!id || !execute) {
            continue;
        }

        const record = { id, execute, message, aliases };
        operationsById.set(id, record);

        for (const key of [id, ...aliases]) {
            if (!operationsMap.has(key)) {
                operationsMap.set(key, record);
            }
        }
    }

    return {
        resolveOperation: (value) => {
            if (value === null || value === undefined) {
                return null;
            }

            const key = normalizeKey(value);
            return operationsMap.get(key) ?? null;
        },
        listOperations: () => Array.from(operationsById.values())
    };
};
