import { NextResponse } from "next/server";
import { readContent, writeContent, SiteContent } from "@mp-auto/content";

// Force Next.js API routes to execute dynamically on every request
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await readContent();
    return NextResponse.json(content);
  } catch (error: any) {
    console.error("API GET Content Error:", error);
    return NextResponse.json(
      { error: "Failed to load content database." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Strict schema structure validation
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body must be a valid JSON object." }, { status: 400 });
    }
    
    const { contact, translations, tractors } = body;
    
    if (!contact || typeof contact !== "object" || !contact.phone || !contact.whatsapp || !contact.mapsUrl) {
      return NextResponse.json({ error: "Missing or invalid contact info." }, { status: 400 });
    }
    
    if (!translations || typeof translations !== "object" || !translations.en || !translations.hi) {
      return NextResponse.json({ error: "Missing or invalid translations schema." }, { status: 400 });
    }
    
    if (!Array.isArray(tractors)) {
      return NextResponse.json({ error: "Tractors field must be an array." }, { status: 400 });
    }
    
    // Check elements inside tractors array
    for (const tractor of tractors) {
      if (!tractor.id || !tractor.name || !tractor.hp || !tractor.price || !tractor.imageUrl) {
        return NextResponse.json({ error: "One or more tractors are missing required keys." }, { status: 400 });
      }
    }
    
    // Cast and save the validated object
    const validatedContent: SiteContent = {
      contact,
      translations,
      tractors
    };
    
    await writeContent(validatedContent);
    
    return NextResponse.json({ success: true, message: "Content updated successfully." });
  } catch (error: any) {
    console.error("API POST Content Error:", error);
    return NextResponse.json(
      { error: "Failed to write content database updates: " + error.message },
      { status: 500 }
    );
  }
}
