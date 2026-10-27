export const name = 'pipeline-hook'
export const inject = ['tools']

export function apply(ctx) {
  console.log('[pipeline-hook] loaded; observing tools/pre-execute, tools/post-execute, tools/result')

  ctx.on('tools/pre-execute', async (exec, next) => {
    console.log(`[pipeline-hook] pre-execute ${exec.name} (${exec.callId})`)
    return next()
  })

  ctx.on('tools/post-execute', async (exec, result, next) => {
    console.log(`[pipeline-hook] post-execute ${exec.name} isError=${result.isError === true}`)
    return next()
  })

  ctx.on('tools/result', (exec, result) => {
    console.log(`[pipeline-hook] result ${exec.name} isError=${result.isError === true}`)
  })
}
