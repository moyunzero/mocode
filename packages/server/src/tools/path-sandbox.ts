import { resolve, relative, isAbsolute, sep } from "path";

/** Resolves `path` under `cwd`, or returns null if it escapes the project root. */
export function resolvePathInCwd(cwd: string, path: string): string | null {
    const root = resolve(cwd);
    const resolved = resolve(root, path);
    const rel = relative(root, resolved);

    if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
        return null;
    }

    return resolved;
}
