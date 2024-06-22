/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "same-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value:
							"default-src 'self'; frame-src 'self' https://www.youtube-nocookie.com/; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; img-src 'self' blob: https://avatars.githubusercontent.com; connect-src 'self' https://api.github.com/graphql; style-src 'self' 'unsafe-inline'; block-all-mixed-content; upgrade-insecure-requests;",
					},
				],
			},
		];
	},
};

module.exports = nextConfig;
