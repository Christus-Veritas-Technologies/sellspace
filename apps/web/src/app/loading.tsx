export default function Loading() {
  return (
    <main className="bg-[#F2F2EF] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Animated loader */}
        <div className="flex flex-col items-center space-y-6">
          {/* Logo animation */}
          <div className="flex items-center gap-1">
            <div
              className="w-10 h-10 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <div
              className="w-10 h-10 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)", animationDelay: "100ms" }}
            />
          </div>

          {/* Animated dots */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: "var(--accent)",
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>

          {/* Loading text */}
          <p
            className="text-sm font-medium"
            style={{ color: "var(--ss-text-secondary)" }}
          >
            Loading...
          </p>

          {/* Skeleton cards (preview) */}
          <div className="w-full space-y-3 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full h-24 rounded-[10px] animate-pulse"
                style={{
                  backgroundColor: "var(--ss-surface-2)",
                  opacity: 0.6 - i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}
