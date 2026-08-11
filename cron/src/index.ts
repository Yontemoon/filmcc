async function main() {
  console.log(`[${new Date().toISOString()}] Executing scheduled task...`)
  console.log('Task completed successfully.')
}

main().catch((err) => {
  console.error('Task failed:', err)
  process.exit(1)
})
