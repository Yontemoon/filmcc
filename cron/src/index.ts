const URL = process.env.PUBLIC_DOMAIN_URL

async function main() {
  console.log(`[${new Date().toISOString()}] Executing scheduled task...`)
  console.log('Task completed successfully.')
  const res = await fetch(`${URL}/api/game`, {
    method: 'POST',
  })
  const data = await res.json()
  console.log(data)
  console.log(`[${new Date().toISOString()}] Finishing scheduled task...`)

  return data
}

main().catch((err) => {
  console.error('Task failed:', err)
  process.exit(1)
})
