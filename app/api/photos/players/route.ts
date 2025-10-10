
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'public', 'photos', 'players');
  const files = await fs.readdir(dirPath);
  // Only return image files
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
  return new Response(JSON.stringify(imageFiles), {
    headers: { 'Content-Type': 'application/json' },
  });
}



