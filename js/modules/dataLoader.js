// Load JSON through HTTP so the site also works with a plain static server
// such as `npx http-server`, without relying on JSON module import support.
export async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.json();
}
