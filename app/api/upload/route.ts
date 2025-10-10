import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return new Response('No file uploaded', { status: 400 });
  }

  // @ts-ignore
  const buffer = Buffer.from(await file.arrayBuffer());
  // @ts-ignore
  const filename = file.name;
  const savePath = path.join(process.cwd(), 'public', 'photos', 'players', filename);
  await fs.writeFile(savePath, buffer);

  return new Response(JSON.stringify({ filename }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
