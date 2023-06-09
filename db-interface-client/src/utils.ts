export function hashCode(strVal: string): number {
    var hash = 0;
    if (strVal.length === 0) return hash;
    for (let i = 0; i < strVal.length; i++) {
        const char = strVal.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
