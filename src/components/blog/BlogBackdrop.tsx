// Fond texturé + halos lumineux des pages blog (repris de l'ancien BlogPage).
export default function BlogBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute start-[-10%] top-[-20%] h-[900px] w-[900px] bg-[radial-gradient(circle,rgba(21,105,83,0.3),transparent_70%)]" />
      <div className="absolute end-[-10%] top-[40%] h-[700px] w-[700px] bg-[radial-gradient(circle,rgba(225,187,127,0.1),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: 'url("/texture.webp")', backgroundSize: "1200px", backgroundRepeat: "repeat" }}
      />
    </div>
  );
}
