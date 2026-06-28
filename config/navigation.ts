/**
 * Navigation / Information Architecture — SINGLE SOURCE OF TRUTH.
 *
 * The header, mega-menu, mobile menu, footer and (later) category pages all
 * read from this file. To rename a label or add a category, edit ONLY this
 * file: hrefs are generated automatically from the slug path, so they always
 * stay in sync.
 *
 * Hierarchy: Department > Category > Subcategory
 *   /confiteria
 *   /confiteria/confites
 *   /confiteria/confites/gomas
 */

/** A single navigation node after hrefs have been resolved. */
export interface NavNode {
  /** Human-readable Spanish label, e.g. "Chocolatinas". */
  label: string;
  /** URL-safe slug for this level, e.g. "chocolatinas". */
  slug: string;
  /** Absolute href generated from the full slug path, e.g. "/confiteria/confites". */
  href: string;
  /** Optional nested categories / subcategories. */
  children?: NavNode[];
}

/** Authoring shape — same as NavNode but without the derived `href`. */
type NavNodeInput = Omit<NavNode, "href" | "children"> & {
  children?: NavNodeInput[];
};

/**
 * Recursively resolves hrefs by accumulating slugs down the tree.
 * Authors only provide `label` + `slug` (+ optional children).
 */
function withHrefs(nodes: NavNodeInput[], parentPath = ""): NavNode[] {
  return nodes.map((node) => {
    const href = `${parentPath}/${node.slug}`;
    return {
      label: node.label,
      slug: node.slug,
      href,
      ...(node.children
        ? { children: withHrefs(node.children, href) }
        : {}),
    };
  });
}

/**
 * Author the IA here. Everything below is derived.
 * Departments are the top-level entries.
 */
const departmentsInput: NavNodeInput[] = [
  {
    label: "Confitería",
    slug: "confiteria",
    children: [
      { label: "Chocolatinas", slug: "chocolatinas" },
      {
        label: "Confites",
        slug: "confites",
        children: [
          { label: "Bombones", slug: "bombones" },
          { label: "Candies", slug: "candies" },
          { label: "Chicles", slug: "chicles" },
          { label: "Gomas", slug: "gomas" },
          { label: "Importados", slug: "importados" },
          { label: "Masmelos", slug: "masmelos" },
          { label: "Tradicionales", slug: "tradicionales" },
        ],
      },
      { label: "Galletas", slug: "galletas" },
      { label: "Mecatos", slug: "mecatos" },
    ],
  },
  {
    label: "Papelería",
    slug: "papeleria",
    children: [{ label: "Rollos", slug: "rollos" }],
  },
];

/** Fully-resolved navigation tree (with hrefs). Consume this everywhere. */
export const departments: NavNode[] = withHrefs(departmentsInput);

/** Convenience: flatten the tree into a single list (e.g. for sitemaps). */
export function flattenNav(nodes: NavNode[] = departments): NavNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenNav(node.children) : []),
  ]);
}
