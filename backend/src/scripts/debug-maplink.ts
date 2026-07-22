// backend/src/scripts/debug-maplink.ts
// Run: npx ts-node src/scripts/debug-maplink.ts "https://maps.app.goo.gl/WGWcJ7T5dmTdyYvH6"

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function debug(url: string) {
  console.log("Original URL:", url);

  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });

  console.log("\nFinal resolved URL:", res.url);
  console.log("Status:", res.status);

  const body = await res.text();
  console.log("\nBody length:", body.length);
  console.log("\nFirst 1000 chars of body:\n", body.slice(0, 1000));

  // Try to find both coordinate patterns
  const atMatch = body.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? res.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const dataMatch = body.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? res.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

  console.log("\n@lat,lng match (viewport):", atMatch ? `${atMatch[1]}, ${atMatch[2]}` : "NOT FOUND");
  console.log("!3d!4d match (exact pin):", dataMatch ? `${dataMatch[1]}, ${dataMatch[2]}` : "NOT FOUND");
}

const testUrl = process.argv[2];
if (!testUrl) {
  console.error("Usage: npx ts-node src/scripts/debug-maplink.ts <mapUrl>");
  process.exit(1);
}

debug(testUrl).catch(console.error);