import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

// Asynchronně zkontroluje, zda složka existuje
async function ensureDirExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.R_OK);
  } catch {
    // Složka neexistuje, vytvoříme ji
    try {
      await mkdir(dirPath, { recursive: true });
      console.log(`Složka ${dirPath} byla vytvořena`);
    } catch (err) {
      console.error(`Chyba při vytváření složky ${dirPath}:`, err);
      throw err;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Žádný soubor nebyl nahrán' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Zajistíme, že soubor je obrázek
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Nahrát lze pouze obrázky' },
        { status: 400 }
      );
    }

    const menuDir = path.join(process.cwd(), 'public', 'menu');
    
    // Zajistíme, že složka existuje
    await ensureDirExists(menuDir);
    
    // Smažeme existující admin-menu.* soubor, pokud existuje
    try {
      const files = await readdir(menuDir);
      for (const existingFile of files) {
        if (existingFile.startsWith('admin-menu.')) {
          const fullPath = path.join(menuDir, existingFile);
          console.log(`Mažu starý soubor: ${fullPath}`);
          await unlink(fullPath);
        }
      }
    } catch (error) {
      console.error('Chyba při mazání starého souboru:', error);
      // Pokračujeme i pokud se smazání nepodaří
    }

    // Vytvoříme nový soubor se stejnou příponou jako původní soubor
    const extension = path.extname(file.name);
    const filename = `admin-menu${extension}`;
    const filepath = path.join(menuDir, filename);
    
    await writeFile(filepath, buffer);
    console.log(`Soubor úspěšně nahrán: ${filepath}`);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Chyba při nahrávání:', error);
    return NextResponse.json(
      { error: 'Chyba při nahrávání souboru' },
      { status: 500 }
    );
  }
} 