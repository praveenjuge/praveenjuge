export const metadata = {
    title: "Page not found (404) | Praveen Juge"
};

export default function NotFound() {
	return (
		<section className="mx-auto max-w-sm px-4 py-48 text-center">
			<h1 className="mb-2 font-bold">Page not found (404)</h1>
			<p className="opacity-75">
				If you think this is a mistake, please let me know at{" "}
				<a
					target="_blank"
					className="underline"
					rel="noreferrer noopener"
					href="https://x.com/praveenjuge"
				>
					Twitter
				</a>
				.
			</p>
		</section>
	);
}
