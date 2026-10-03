import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone panel">
      <h1>This page isn’t here.</h1>
      <p>Return to your family workspace to continue.</p>
      <Link className="button primary" href="/">
        Back to Linea
      </Link>
    </main>
  );
}
