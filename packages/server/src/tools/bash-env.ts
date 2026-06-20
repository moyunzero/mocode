/** Minimal env passed to agent shell commands; avoids leaking server secrets. */
export function buildBashEnv(): Record<string, string> {
    const allowlist = ["PATH", "HOME", "USER", "SHELL", "LANG", "LC_ALL", "TMPDIR"] as const;
    const env: Record<string, string> = { TERM: "dumb" };

    for (const key of allowlist) {
        const value = process.env[key];
        if (value !== undefined) {
            env[key] = value;
        }
    }

    return env;
}
