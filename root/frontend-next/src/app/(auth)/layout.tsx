// ABOUTME: Layout for authentication pages (login, signup, etc.)
// ABOUTME: Centered card layout with noise texture background

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="noise-bg min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
