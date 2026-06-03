import { mkdir } from 'node:fs/promises'
import { createError, defineEventHandler } from 'h3'
import { openInFileManager } from '../utils/open-path'
import { OUTPUT_ROOT } from '../utils/path-guard'

export default defineEventHandler(async () => {
  // Ensure the folder exists; otherwise the OS open command fails silently.
  await mkdir(OUTPUT_ROOT, { recursive: true })

  try {
    await openInFileManager(OUTPUT_ROOT)
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to open output folder: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    })
  }
})
