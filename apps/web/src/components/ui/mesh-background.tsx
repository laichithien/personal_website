export function MeshBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 14% 18%, rgba(59, 130, 246, 0.24), transparent 28%)",
            "radial-gradient(circle at 82% 22%, rgba(34, 211, 238, 0.14), transparent 22%)",
            "radial-gradient(circle at 78% 78%, rgba(37, 99, 235, 0.22), transparent 30%)",
            "linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(3, 7, 18, 0.98) 100%)",
          ].join(", "),
        }}
      />

      <div className="absolute inset-x-0 top-[-12%] h-[32rem] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_60%)] blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />

      <div className="absolute inset-0 bg-noise opacity-35" />
    </div>
  );
}
