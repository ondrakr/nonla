import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Nemusíme se starat o filename - vždy mažeme obrázek s ID 'admin-menu'
    // pro zjednodušení, ale pro kompatibilitu s frontendem ponecháme strukturu
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Nebyl specifikován název souboru' },
        { status: 400 }
      );
    }

    // Ověříme, že se jedná o admin obrázek
    if (!filename.includes('admin-menu')) {
      return NextResponse.json(
        { error: 'Lze smazat pouze admin obrázek' },
        { status: 400 }
      );
    }

    try {
      // Pokusíme se najít a smazat obrázek v Cloudinary
      const { resources } = await cloudinary.search
        .expression('public_id:menu/admin-menu')
        .execute();
      
      if (resources && resources.length > 0) {
        // Smažeme obrázek
        const result = await cloudinary.uploader.destroy('menu/admin-menu');
        console.log(`Soubor byl úspěšně smazán z Cloudinary, výsledek: ${result}`);
        return NextResponse.json({ success: true });
      } else {
        console.log('Obrázek v Cloudinary nebyl nalezen');
        return NextResponse.json(
          { error: 'Soubor neexistuje' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('Chyba při hledání/mazání obrázku v Cloudinary:', error);
      throw error;
    }
  } catch (error) {
    console.error('Chyba při mazání:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání souboru' },
      { status: 500 }
    );
  }
} 