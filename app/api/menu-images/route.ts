import { NextResponse } from 'next/server';
import { readdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

// Asynchronně zkontroluje, zda složka existuje
async function folderExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const menuDir = path.join(process.cwd(), 'public', 'menu');
    
    // Zkontrolujeme, zda složka existuje
    const exists = await folderExists(menuDir);
    if (!exists) {
      console.log(`Složka ${menuDir} neexistuje`);
      return NextResponse.json({ images: [] });
    }
    
    // Načteme soubory
    const files = await readdir(menuDir);
    
    if (!files || files.length === 0) {
      return NextResponse.json({ images: [] });
    }
    
    // Rozdělíme soubory na admin a ostatní menu obrázky
    const adminImage = files.find(file => file.startsWith('admin-menu.'));
    const menuImages = files
      .filter(file => /^menu\d+\.(jpg|jpeg|png|gif)$/i.test(file))
      .sort((a, b) => {
        // Seřadíme podle čísla v názvu
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });

    // Spojíme admin obrázek (pokud existuje) s menu obrázky
    const allImages = [
      ...(adminImage ? [`/menu/${adminImage}`] : []),
      ...menuImages.map(file => `/menu/${file}`)
    ];

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error('Chyba při načítání obrázků:', error);
    return NextResponse.json({ images: [] });
  }
} 