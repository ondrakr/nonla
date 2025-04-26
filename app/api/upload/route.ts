import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';

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

    // Zajistíme, že soubor je obrázek
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Nahrát lze pouze obrázky' },
        { status: 400 }
      );
    }

    // Převést soubor na buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Převést buffer na base64 pro Cloudinary
    const base64Data = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64Data}`;
    
    // Zkusit najít a smazat existující obrázek admin-menu v Cloudinary
    try {
      const { resources } = await cloudinary.search
        .expression('public_id:admin-menu')
        .execute();
      
      if (resources && resources.length > 0) {
        await cloudinary.uploader.destroy('admin-menu');
        console.log('Existující obrázek admin-menu byl smazán z Cloudinary');
      }
    } catch (error) {
      console.error('Chyba při hledání/mazání existujícího obrázku:', error);
      // Pokračujeme i pokud se smazání nepodaří
    }

    // Nahrát nový obrázek do Cloudinary s pevným public_id
    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: 'admin-menu',
      folder: 'menu',
      overwrite: true
    });

    console.log(`Soubor úspěšně nahrán do Cloudinary: ${result.secure_url}`);

    return NextResponse.json({ 
      success: true, 
      filename: result.public_id,
      url: result.secure_url
    });
  } catch (error) {
    console.error('Chyba při nahrávání:', error);
    return NextResponse.json(
      { error: 'Chyba při nahrávání souboru' },
      { status: 500 }
    );
  }
} 