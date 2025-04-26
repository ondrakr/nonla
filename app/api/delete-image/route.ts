import { NextRequest, NextResponse } from 'next/server';
import { unlink, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

// Asynchronně zkontroluje, zda soubor existuje
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nebyl specifikován název souboru' },
        { status: 400 }
      );
    }

    // Ověříme, že se jedná o admin obrázek
    if (!filename.startsWith('admin-menu.')) {
      return NextResponse.json(
        { error: 'Lze smazat pouze admin obrázek' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'menu', filename);
    
    // Ověříme, zda soubor existuje
    const exists = await fileExists(filepath);
    if (!exists) {
      console.log(`Soubor ${filepath} neexistuje, nelze smazat`);
      return NextResponse.json(
        { error: 'Soubor neexistuje' },
        { status: 404 }
      );
    }
    
    await unlink(filepath);
    console.log(`Soubor ${filepath} byl úspěšně smazán`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání souboru' },
      { status: 500 }
    );
  }
} 