import { spawn } from 'node:child_process'
import { platform } from 'node:os'

function getOpenCommand(): string {
  switch (platform()) {
    case 'darwin':
      return 'open'
    case 'win32':
      // ".exe" is required: spawn() without a shell does not apply PATHEXT,
      // so bare "explorer" can fail with ENOENT on Windows.
      return 'explorer.exe'
    default:
      return 'xdg-open'
  }
}

/**
 * Open a filesystem path in the OS file manager.
 * Resolves on success, rejects with an Error on failure (e.g. command not
 * found on a headless server). On Windows, explorer.exe returns a non-zero
 * exit code even on success, so any cleanly spawned process is treated as
 * success there.
 */
export function openInFileManager(targetPath: string): Promise<void> {
  const isWindows = platform() === 'win32'
  return new Promise((resolve, reject) => {
    const child = spawn(getOpenCommand(), [targetPath], { stdio: 'ignore' })

    child.on('error', (err) => {
      reject(err)
    })

    child.on('close', (code) => {
      if (code === 0 || isWindows) {
        resolve()
      } else {
        reject(new Error(`open command exited with code ${code}`))
      }
    })
  })
}
