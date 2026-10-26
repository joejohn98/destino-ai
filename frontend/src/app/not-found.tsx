export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
      </div>
    </div>
  );
}
