type ClassValue = string | false | null | undefined;

/** Minimal class name joiner; avoids pulling a dependency for conditional styles. */
export const cn = (...values: ClassValue[]): string => values.filter(Boolean).join(' ');
