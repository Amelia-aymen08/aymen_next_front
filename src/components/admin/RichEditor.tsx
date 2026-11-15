"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { useEffect, useRef } from "react";
import { backendUrl, uploadImage } from "@/lib/adminApi";

type Props = {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
};

/**
 * Éditeur visuel des articles (titres, gras, listes, liens, images, vidéos YouTube).
 * Produit du HTML simple, nettoyé ensuite par le backend.
 */
export default function RichEditor({ value, onChange, dir = "ltr", placeholder = "Rédigez l'article…" }: Props) {
  const lastEmitted = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        dir,
        class: "article-body min-h-[360px] px-5 py-4 outline-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? "" : e.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // Contenu remplacé de l'extérieur (traduction automatique, chargement) : on le recharge dans l'éditeur.
  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      lastEmitted.current = value;
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/15 bg-[#031B17] focus-within:border-[#F7C66A]/70">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (laisser vide pour retirer le lien) :", previous || "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Lien de la vidéo YouTube :");
    const m = url?.match(/(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!m) return;
    // Inséré comme lien : le site le transforme en lecteur vidéo à l'affichage.
    editor
      .chain()
      .focus()
      .insertContent(`<p><a href="https://www.youtube.com/watch?v=${m[1]}">Vidéo YouTube</a></p>`)
      .run();
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      const alt = window.prompt("Description de l'image (pour Google et l'accessibilité) :", "") || "";
      editor.chain().focus().setImage({ src: backendUrl(url), alt }).run();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const btn = (active: boolean) =>
    `rounded px-2.5 py-1.5 text-sm transition ${active ? "bg-[#F7C66A] text-[#031B17]" : "text-white/80 hover:bg-white/10"}`;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.04] px-2 py-1.5" role="toolbar" aria-label="Mise en forme">
      <button type="button" className={btn(state.h2)} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre de section">
        Titre
      </button>
      <button type="button" className={btn(state.h3)} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Sous-titre">
        Sous-titre
      </button>
      <span className="mx-1 h-5 w-px bg-white/15" />
      <button type="button" className={`${btn(state.bold)} font-bold`} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
        G
      </button>
      <button type="button" className={`${btn(state.italic)} italic`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
        I
      </button>
      <button type="button" className={btn(state.link)} onClick={setLink} title="Lien">
        <i className="fa-solid fa-link" aria-hidden /> <span className="sr-only">Lien</span>
      </button>
      <span className="mx-1 h-5 w-px bg-white/15" />
      <button type="button" className={btn(state.bullet)} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
        <i className="fa-solid fa-list-ul" aria-hidden /> <span className="sr-only">Liste à puces</span>
      </button>
      <button type="button" className={btn(state.ordered)} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
        <i className="fa-solid fa-list-ol" aria-hidden /> <span className="sr-only">Liste numérotée</span>
      </button>
      <button type="button" className={btn(state.quote)} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation">
        <i className="fa-solid fa-quote-left" aria-hidden /> <span className="sr-only">Citation</span>
      </button>
      <span className="mx-1 h-5 w-px bg-white/15" />
      <button type="button" className={btn(false)} onClick={() => fileRef.current?.click()} title="Insérer une image">
        <i className="fa-regular fa-image" aria-hidden /> Image
      </button>
      <button type="button" className={btn(false)} onClick={addYoutube} title="Insérer une vidéo YouTube">
        <i className="fa-brands fa-youtube" aria-hidden /> Vidéo
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <span className="ms-auto" />
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title="Annuler">
        <i className="fa-solid fa-rotate-left" aria-hidden /> <span className="sr-only">Annuler</span>
      </button>
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
        <i className="fa-solid fa-rotate-right" aria-hidden /> <span className="sr-only">Rétablir</span>
      </button>
    </div>
  );
}
