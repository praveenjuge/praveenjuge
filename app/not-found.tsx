import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Page not found (404) | Praveen Juge",
};

export default function NotFound() {
	return (
		<div className="mx-auto max-w-sm px-4 py-48 text-center">
			<h1 className="mb-2 font-bold">Page not found (404)</h1>
			<p className="opacity-75">
				If you think this is a mistake, please let me know at{" "}
				<a
					rel="noreferrer noopener"
					target="_blank"
					className="underline"
					href="https://x.com/praveenjuge"
				>
					Twitter
				</a>
				.
			</p>
		</div>
	);
}
