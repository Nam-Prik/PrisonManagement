import { useEffect, useState } from 'react'
import { getMaintainers } from '../api/maintainer.api'
import type { Maintainer } from '../types/dto/maintainer.dto'

export default function Maintainers() {
  const [maintainers, setMaintainers] = useState<Maintainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMaintainers()
      .then(setMaintainers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main>
      <h1>Maintainers</h1>
      <ul>
        {maintainers.map((m) => (
          <li key={m.id}>
            {m.firstName} {m.lastName} — {m.maintenanceSkill} — {m.companyName}
          </li>
        ))}
      </ul>
    </main>
  )
}
