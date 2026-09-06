import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = join(root, "data", "database.json");
const port = Number(process.env.PORT || 8787);

async function readDatabase() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    return { registrations: [], contributions: [] };
  }
}
async function saveDatabase(database) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(database, null, 2));
}
function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  if (!request.url.startsWith("/api/"))
    return send(response, 404, { error: "Not found" });
  const pathname = new URL(request.url, `http://${request.headers.host}`)
    .pathname;
  const database = await readDatabase();
  const resource = pathname.split("/")[2];
  try {
    if (request.method === "GET" && pathname === "/api/registrations") {
      const rows = database.registrations
        .map((registration) => ({
          ...registration,
          contributions: database.contributions.filter(
            (item) => item.registration_id === registration.registration_id,
          ),
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return send(response, 200, rows);
    }
    if (request.method === "GET" && pathname === "/api/contributions")
      return send(response, 200, database.contributions);
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const payload = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
    if (
      request.method === "POST" &&
      ["registrations", "contributions"].includes(resource)
    ) {
      const item = { id: Date.now(), ...payload };
      database[resource].push(item);
      await saveDatabase(database);
      return send(response, 201, item);
    }
    if (request.method === "PATCH" && resource === "contributions") {
      const item = database.contributions.find(
        (entry) => entry.id === Number(pathname.split("/").pop()),
      );
      if (!item)
        return send(response, 404, { error: "Contribution not found" });
      Object.assign(item, payload);
      await saveDatabase(database);
      return send(response, 200, item);
    }
    return send(response, 404, { error: "Not found" });
  } catch (error) {
    return send(response, 400, { error: error.message });
  }
});
server.listen(port, () =>
  console.log(`Local database API running at http://localhost:${port}`),
);
