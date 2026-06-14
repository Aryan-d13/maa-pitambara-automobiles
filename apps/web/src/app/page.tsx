import { readContent } from "@mp-auto/content";
import FarmerPortal from "@/components/FarmerPortal";

// Disable static caching so modifications from the admin panel reflect instantly
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const content = await readContent();
  
  return <FarmerPortal initialContent={content} />;
}
