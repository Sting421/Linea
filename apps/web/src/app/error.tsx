'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone panel">
      <h1>We couldn’t open this view.</h1>
      <p>Your recorded check-ins remain in the service. Try opening the view again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
