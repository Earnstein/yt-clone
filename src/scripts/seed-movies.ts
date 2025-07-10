import { db } from "@/db";
import { categories, users, videos } from "@/db/schema";
import { VIDEO_ID_PREFIX } from "@/lib/constants";
import { generateUniqueId } from "@/lib/utils";
type Video = {
  title: string;
  description: string;
  visibility: "public" | "private";
};
const videosData: Video[] = [
  {
    title: "The Matrix",
    description:
      "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    visibility: "public",
  },
  {
    title: "The Matrix Reloaded",
    description:
      "The Matrix Reloaded is a 2003 American science fiction action film and the second installment in The Matrix film series.",
    visibility: "public",
  },
  {
    title: "The Matrix Revolutions",
    description:
      "The Matrix Revolutions is a 2003 American science fiction action film and the third installment in The Matrix film series.",
    visibility: "public",
  },
  {
    title: "The Matrix Resurrections",
    description:
      "The Matrix Resurrections is a 2021 American science fiction action film and the fourth installment in The Matrix film series.",
    visibility: "public",
  },
  {
    title: "The Avengers",
    description:
      "The Avengers is a 2012 American science fiction action film and the first installment in The Avengers film series.",
    visibility: "public",
  },
  {
    title: "The Avengers: Age of Ultron",
    description:
      "The Avengers: Age of Ultron is a 2015 American science fiction action film and the second installment in The Avengers film series.",
    visibility: "public",
  },
  {
    title: "Agatha Christie's And Then There Were None",
    description:
      "Agatha Christie's And Then There Were None is a 2015 American science fiction action film and the third installment in The Avengers film series.",
    visibility: "public",
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    description:
      "Harry Potter and the Philosopher's Stone is a 2001 American science fiction action film and the first installment in The Harry Potter film series.",
    visibility: "public",
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    description:
      "Harry Potter and the Chamber of Secrets is a 2002 American science fiction action film and the second installment in The Harry Potter film series.",
    visibility: "public",
  },
  {
    title: "Harry Potter and the Prisoner of Azkaban",
    description:
      "Harry Potter and the Prisoner of Azkaban is a 2004 American science fiction action film and the third installment in The Harry Potter film series.",
    visibility: "public",
  },
];

async function seedMovies() {
  try {
    const existingVideos = await db.select().from(videos);
    if (existingVideos.length > 0) {
      console.log("🛑 Videos already seeded");
      process.exit(0);
    }
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
