import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Carga dinamicamente los modulos de operaciones desde la carpeta "operations" y los registra en un mapa para resolverlos por id o alias.
// Cada modulo debe exportar un id (string), una funcion execute, un mensaje (string) y opcionalmente una lista de aliases (array de strings)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const operationsDir = path.join(__dirname, 'operations');

const normalizeKey = (value) => String(value).trim().toLowerCase();

// Normaliza y filtra una lista de strings, eliminando los vacios
const safeNormalizeList = (values) => values
    .map((value) => normalizeKey(value))
    .filter((value) => value.length > 0);

// Carga las operaciones desde los modulos y devuelve un objeto con funciones para resolver y listar operaciones
export const loadOperations = async () => {
    const entries = await readdir(operationsDir, { withFileTypes: true });
    const operationsMap = new Map();
    const operationsById = new Map();

    // Recorre los archivos de la carpeta, importa los modulos y registra las operaciones en el mapa
    for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.js')) {
            continue;
        }

        // Importamos el modulo dinamicamente para leer su id, execute, message y aliases
        const modulePath = path.join(operationsDir, entry.name);
        const moduleUrl = pathToFileURL(modulePath).href;
        const moduleExports = await import(moduleUrl);

        // Normalizamos el id y aliases, y verificamos que el modulo tenga un id string y una funcion execute
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

        // Si el modulo no tiene un id o una funcion execute, lo ignoramos
        if (!id || !execute) {
            continue;
        }

        // Registramos la operacion en el mapa usando su id y aliases como claves, apuntando a un mismo registro con id, execute, message y aliases
        const record = { id, execute, message, aliases };
        operationsById.set(id, record);

        for (const key of [id, ...aliases]) {
            if (!operationsMap.has(key)) {
                operationsMap.set(key, record);
            }
        }
    }

    // Devuelve funciones para resolver una operacion por id o alias, y para listar todas las operaciones disponibles
    return {
        resolveOperation: (value) => {
            if (value === null || value === undefined) {
                return null;
            }
            // Normalizamos el valor de entrada y buscamos la operacion en el mapa, devolviendo null si no se encuentra
            const key = normalizeKey(value);
            return operationsMap.get(key) ?? null;
        },
        // Devuelve un array con las operaciones disponibles, usando su id para identificarlas
        listOperations: () => Array.from(operationsById.values())
    };
};
