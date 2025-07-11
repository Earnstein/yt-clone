import { db } from "@/db";
import { categories, users, videos } from "@/db/schema";
import { VIDEO_ID_PREFIX } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
import { faker } from "@faker-js/faker";

const createRandomVideo = () => {
  return {
    title: faker.word.words(3),
    description: faker.lorem.paragraph(1),
    visibility: faker.helpers.arrayElement(["public", "private"]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
};
type Video = {
  title: string;
  description: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
};
const videosData: Video[] = Array.from({ length: 100 }, createRandomVideo);

async function seedMovies() {
  try {
    const [allCategories, allUsers] = await Promise.all([
      db.select().from(categories),
      db.select().from(users),
    ]);
    console.log("🌱 Categories and users fetched successfully");
    const [categoryIds, userIds] = [allCategories, allUsers].map((arr) =>
      arr.map((item) => item.id)
    );

    await db.insert(videos).values(
      videosData.map((video) => ({
        id: generateUniqueId(VIDEO_ID_PREFIX),
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
        visibility: video.visibility as "public" | "private",
        title: video.title,
        description: video.description,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      }))
    );
    console.log("🌱 Videos seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding movies:", error);
  }
}

async function deleteMovies() {
  try {
    await db.delete(videos);
    console.log("🌱 Videos deleted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting movies:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-d")) {
    await deleteMovies();
  } else {
    await seedMovies();
  }
}

main();
