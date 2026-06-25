const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen flex items-center justify-center relative mx-auto max-w-5xl font-spaceGrotesk ">
      {children}
    </main>
  );
};

export default Layout;
