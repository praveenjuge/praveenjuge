export default function robots() {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
			},
		],
		sitemap: "https://praveenjuge.com/sitemap.xml",
		host: "https://praveenjuge.com",
	};
}
