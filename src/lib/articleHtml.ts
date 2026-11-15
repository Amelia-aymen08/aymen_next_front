const YT = /(?:youtube\.com\/(?:watch\?(?:[^"]*&amp;|[^"]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Un paragraphe qui ne contient qu'un lien YouTube devient un lecteur vidéo.
 * (L'éditeur du dashboard stocke les vidéos sous forme de lien.)
 */
export function embedYoutube(html: string): string {
  return html.replace(/<p>\s*<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>\s*<\/p>/g, (whole, href: string) => {
    const m = href.match(YT);
    if (!m) return whole;
    return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="YouTube" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  });
}
