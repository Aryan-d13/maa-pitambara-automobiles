import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Generate a clean filename
    const ext = path.extname(file.name) || ".png";
    const baseName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase()
      .slice(0, 50);
    const timestamp = Date.now();
    const fileName = `${baseName}_${timestamp}${ext}`;

    // Determine the target directory — the web app's public/images folder
    // In monorepo: from apps/admin -> apps/web/public/images
    let targetDir: string;

    // Try to find the web app's public/images directory
    const candidates = [
      path.resolve(process.cwd(), "..", "web", "public", "images"),
      path.resolve(process.cwd(), "..", "..", "apps", "web", "public", "images"),
      path.resolve(process.cwd(), "public", "images"),
    ];

    targetDir = candidates[0]; // default
    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        targetDir = candidate;
        break;
      } catch {
        // continue checking
      }
    }

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Write the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Return the public URL path for use in the frontend
    const publicUrl = `/images/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      message: "Image uploaded successfully.",
    });
  } catch (error: any) {
    console.error("Image Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image: " + error.message },
      { status: 500 }
    );
  }
}
