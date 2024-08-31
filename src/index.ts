import { Hono } from "hono";
import { cors } from "hono/cors";
import { identifyPlant } from "../lib/plantnet";
import { getPlant } from "../lib/perenual";
import type { PlantInfo } from "../types";

const app = new Hono().basePath("/api");

app.use("*", cors());

app.post("/identify", async (c) => {
	const body = await c.req.parseBody();
	const file = body.file;

	if (!file) {
		return c.json({ message: "File is required" }, 400);
	}

	try {
		const results = await identifyPlant(file);
		if (!results) {
			return c.json({ message: "No plant found" }, 404);
		}

		let plant: PlantInfo | null = await getPlant(
			results.species.scientificNameWithoutAuthor,
		);
		if (!plant) {
			plant = await getPlant(results.species.commonNames[0]);
		}

    if (!plant) {
      return c.json({ message: "No plant found" }, 404);
    }

		return c.json({ data: plant });
	} catch (error) {
		console.error("Error fetching data from Plantnet API:", error);
		return c.json({ message: "Error fetching plant data" }, 500);
	}
});

export default app;
