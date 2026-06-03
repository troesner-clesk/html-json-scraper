import { resolve, sep } from 'node:path'
import { createError, defineEventHandler, getQuery } from 'h3'
import { openInFileManager } from '../utils/open-path'
import { OUTPUT_ROOT } from '../utils/path-guard'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const inputPath = query.path as string

  if (!inputPath) {
    throw createError({
      statusCode: 400,
      message: 'path parameter required',
    })
  }

  // Resolve path and validate it's within the output directory.
  // Use the platform path separator so the check also holds on Windows.
  const resolvedPath = resolve(inputPath)

  if (
    resolvedPath !== OUTPUT_ROOT &&
    !resolvedPath.startsWith(`${OUTPUT_ROOT}${sep}`)
  ) {
    throw createError({
      statusCode: 403,
      message: 'Access denied: path must be within output directory',
    })
  }

  try {
    await openInFileManager(resolvedPath)
    return { success: true }
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Failed to open folder',
    })
  }
})
