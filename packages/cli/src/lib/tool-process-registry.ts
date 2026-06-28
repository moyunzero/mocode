/** Tracks in-flight bash/MCP subprocesses so Esc can kill them immediately. */
const active = new Set<{ kill: () => void }>();

export function trackToolProcess(proc: { kill: () => void; exited: Promise<number> }): void {
  active.add(proc);
  void proc.exited.finally(() => {
    active.delete(proc);
  });
}

export function killTrackedToolProcesses(): void {
  for (const proc of active) {
    try {
      proc.kill();
    } catch {
      // Process may already have exited.
    }
  }
}
