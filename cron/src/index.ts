import 'dotenv/config'

const URL = process.env.PUBLIC_DOMAIN_URL

async function main() {
  try {
    console.log(`[${new Date().toISOString()}] Executing scheduled task...`)

    const res = await fetch(`${URL}/api/generate`, {
      method: 'POST',
    })

    if (!res.ok) {
      throw new Error("Error on '/api/generate' request.")
    }
    const data = await res.json()

    const start = data.start
    const end = data.end
    console.log(`Start found as ${start.title} and ending on ${end.name}`)
    const normizeData = {
      start: {
        id: start.id,
        type: 'MOVIE',
        label: start.title,
        img_path: start.poster_path,
      },
      end: {
        id: end.id,
        type: 'PERSON',
        label: end.name,
        img_path: end.profile_path,
      },
    }

    const uploadRes = await fetch(`${URL}/api/generate/upload`, {
      method: 'POST',
      body: JSON.stringify(normizeData),
    })

    if (!uploadRes.ok) {
      return
    }

    const uploadData = await uploadRes.json()

    console.log(`[${new Date().toISOString()}] Finishing scheduled task...`)
    console.log('Task completed successfully.')

    return data
  } catch (error) {
    console.error(error)
  }
}

main().catch((err) => {
  console.error('Task failed:', err)
  process.exit(1)
})
