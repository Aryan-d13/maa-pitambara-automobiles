import { readContent } from "@mp-auto/content";
import ContentForm from "@/components/ContentForm";

// Ensure content is loaded live on every request
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHome() {
  const content = await readContent();
  
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <ContentForm initialContent={content} />
    </main>
  );
}
