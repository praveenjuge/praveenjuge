const fs = require("node:fs");
const path = require("node:path");
const puppeteer = require("puppeteer");

// Function to read metadata.json and extract slugs and titles for blog collection
const getSlugsAndTitles = (metadataPath) => {
	const data = fs.readFileSync(metadataPath, "utf-8");
	const metadata = JSON.parse(data).metadata;
	return metadata
		.filter((entry) => entry.collection === "blog")
		.map((entry) => ({
			slug: entry.slug,
			title: entry.title,
		}));
};

// Function to capture screenshots
const captureScreenshots = async (urls, outputDir) => {
	const browser = await puppeteer.launch();

	for (const url of urls) {
		const slug = url.split("/").pop();
		const filePath = path.join(outputDir, `${slug}.jpg`);

		// Skip if the image already exists
		if (fs.existsSync(filePath)) {
			console.log(`Screenshot already exists at ${filePath}, skipping...`);
			continue;
		}

		const page = await browser.newPage();
		await page.setViewport({ width: 1200, height: 627 });
		await page.goto(url, { waitUntil: "networkidle2" });

		// Ensure directory exists
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		await page.screenshot({ path: filePath, type: "jpeg", quality: 90 });
		console.log(`Screenshot saved at ${filePath}`);
		await page.close();
	}

	await browser.close();
};

// Main function to execute the script
(async () => {
	const metadataPath = path.join(__dirname, "content", "metadata.json");
	const outputDir = path.join(__dirname, "public", "og", "blog");
	const baseUrl = "https://praveenjuge.com/blog/";

	const slugsAndTitles = getSlugsAndTitles(metadataPath);
	const urls = slugsAndTitles.map((entry) => `${baseUrl}${entry.slug}`);

	await captureScreenshots(urls, outputDir);
})();
