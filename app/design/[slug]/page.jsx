import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocumentBySlug, getDocumentSlugs } from "outstatic/server";

export default async function Design(props) {
    const params = await props.params;
    const design = getDocumentBySlug("design", params.slug, ["slug", "coverImage"]);

    if (!design) notFound();

    return (
		<article className="mx-auto flex max-w-xl flex-col gap-6 p-4 font-medium">
			<Link href="/design">← All Designs</Link>
			<Link target="_blank" href={design.coverImage ?? ""}>
				<Image
					width={700}
					height={1000}
					alt={design.coverImage ?? ""}
					src={design.coverImage ?? ""}
				/>
			</Link>
		</article>
	);
}

export function generateStaticParams() {
	return getDocumentSlugs("design").map((slug) => ({ slug }));
}
