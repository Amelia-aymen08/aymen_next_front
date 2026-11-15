// URL publique de l'API backend (Express), utilisée par le navigateur.
// En local : NEXT_PUBLIC_API_URL=http://localhost:5000
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backend.aymenpromotion-dz.com").replace(/\/$/, "");

// URL utilisée par le serveur Next.js pour lire l'API.
// Sur le VPS : API_INTERNAL_URL=http://127.0.0.1:5000 — le serveur ne peut pas se joindre
// lui-même par son IP publique (NAT Ayrade), et c'est plus rapide.
export const SERVER_API_URL = (process.env.API_INTERNAL_URL || API_BASE_URL).replace(/\/$/, "");

export const PDF_WORKER_URL = "/pdf.worker.min.mjs";
