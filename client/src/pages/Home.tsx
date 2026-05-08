import { Link } from 'react-router'

export default function Home() {
  return (
    <main>
      <h1>ZedYor</h1>
      <nav>
        <Link to="/maintainer">Maintainers</Link>
      </nav>
    </main>
  )
}
