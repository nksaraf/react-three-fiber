import { Title } from '@solidjs/meta'

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <h1>Page Not Found</h1>
      <p>
        Visit{' '}
        <a href="https://docs.solidjs.com/start" target="_blank">
          docs.solidjs.com/start
        </a>{' '}
        to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
