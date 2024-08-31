import type { PlantInfo } from "../types";

const PERENUAL_API_URL = "https://perenual.com/api";

if (!process.env.PERENUAL_API_KEY) {
	throw new Error("PLANTNET_API_KEY environment variable is not set");
}
const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY;

interface Dimensions {
	type: string | null;
	min_value: number;
	max_value: number;
	unit: string;
}

interface WaterRequirement {
	unit: string;
	value: string;
}

interface WateringBenchmark {
	value: string;
	unit: string;
}

interface PruningCount {
	amount: number;
	interval: string;
}

interface Hardiness {
	min: string;
	max: string;
}

interface HardinessLocation {
	full_url: string;
	full_iframe: string;
}

interface DefaultImage {
	image_id: number;
	license: number;
	license_name: string;
	license_url: string;
	original_url: string;
	regular_url: string;
	medium_url: string;
	small_url: string;
	thumbnail: string;
}

interface PerenualPlantData {
	id: number;
	common_name: string;
	scientific_name: string[];
	other_name: string[];
	family: string;
	origin: string | null;
	type: string;
	dimensions: Dimensions;
	cycle: string;
	watering: string;
	depth_water_requirement: WaterRequirement;
	volume_water_requirement: WaterRequirement;
	watering_period: string;
	watering_general_benchmark: WateringBenchmark;
	plant_anatomy: Record<string, string>;
	sunlight: string[];
	pruning_month: string[];
	pruning_count: PruningCount;
	seeds: number;
	attracts: string[];
	propagation: string[];
	hardiness: Hardiness;
	hardiness_location: HardinessLocation;
	flowers: boolean;
	flowering_season: string;
	color: string;
	soil: string[];
	pest_susceptibility: string | null;
	cones: boolean;
	fruits: boolean;
	edible_fruit: boolean;
	fruit_color: string | null;
	fruiting_season: string | null;
	harvest_season: string | null;
	harvest_method: string;
	leaf: boolean;
	leaf_color: string[];
	edible_leaf: boolean;
	growth_rate: string;
	maintenance: string;
	medicinal: boolean;
	poisonous_to_humans: boolean;
	poisonous_to_pets: boolean;
	drought_tolerant: boolean;
	salt_tolerant: boolean;
	thorny: boolean;
	invasive: boolean;
	rare: boolean;
	rare_level: string;
	tropical: boolean;
	cuisine: boolean;
	indoor: boolean;
	care_level: string;
	description: string;
	default_image: DefaultImage;
}

interface SearchResult {
	id: number;
	commonName: string;
	scientificNames: string[];
	otherNames: string[];
	thumbnail: string;
}

export async function getPlant(query: string) {
	const response = await fetch(
		`${PERENUAL_API_URL}/species-list?key=${PERENUAL_API_KEY}&q=${query}`,
	);

	if (!response.ok) {
		throw new Error(`Perenual API responded with status: ${response.status}`);
	}

	const searchResults: { data: SearchResult[] } = await response.json();

	if (searchResults.data.length === 0) {
		return null;
	}

	const id = searchResults.data[0].id;

	const detailsResponse = await fetch(
		`${PERENUAL_API_URL}/species/details/${id}?key=${PERENUAL_API_KEY}`,
	);

	if (!detailsResponse.ok) {
		throw new Error(`Perenual API responded with status: ${response.status}`);
	}

	const data: PerenualPlantData = await detailsResponse.json();
	if (!data) {
		return null;
	}

	const plant: PlantInfo = {
		id: data.id,
		commonName: data.common_name,
		scientificName: data.scientific_name?.[0],
		careLevel: data.care_level,
		description: data.description,
		image: data.default_image.regular_url,
		indoor: data.indoor,
		thumbnail: data.default_image.thumbnail,
		type: data.type,
		cycle: data.cycle,
	};

	return plant;
}
