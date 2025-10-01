export const generateId = (prefix = 'ts') => `${prefix}_${crypto.randomUUID()}`
