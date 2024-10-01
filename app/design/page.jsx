import Image from "next/image";
import Link from "next/link";
import { load } from "outstatic/server";

export const metadata = {
    title: "Designs | Praveen Juge"
};

const allDesigns = await (await load())
	.find({ collection: "design" }, ["coverImage"])
	.sort({ publishedAt: -1 })
	.toArray();

export default function Page() {
	return (
		<section className="mx-auto flex max-w-xl flex-col gap-6 p-4">
			<h2 className="font-bold">Designs</h2>

			{allDesigns.map((item, id) => (
				<Link
					target="_blank"
					key={item.coverImage}
					href={item.coverImage ?? ""}
				>
					<Image
						width={612}
						height={459}
						priority={id === 0}
						className="rounded"
						alt={item.coverImage ?? ""}
						src={item.coverImage ?? ""}
						loading={id > 10 ? "lazy" : "eager"}
					/>
				</Link>
			))}
		</section>
	);
}
