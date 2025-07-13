export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">403</h1>
        <p className="text-xl text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}