// Utility to generate Excel-style column names (A, B, ..., Z, AA, AB, ...)
export function excelColumnName(n) {
    let name = "";
    while (n >= 0) {
        name = String.fromCharCode((n % 26) + 65) + name;
        n = Math.floor(n / 26) - 1;
    }
    return name;
}
