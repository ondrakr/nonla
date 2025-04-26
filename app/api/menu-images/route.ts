import { NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';

// Definice typů pro resource z Cloudinary
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  [key: string]: any;
}

export async function GET() {
  try {
    // Hledáme obrázky v adresáři 'menu' v Cloudinary
    const { resources } = await cloudinary.search
      .expression('folder:menu')
      .sort_by('public_id', 'asc')
      .max_results(100)
      .execute() as { resources: CloudinaryResource[] };
    
    if (!resources || resources.length === 0) {
      return NextResponse.json({ images: [] });
    }
    
    // Rozdělíme obrázky na admin a ostatní menu obrázky
    const adminImage = resources.find((resource: CloudinaryResource) => 
      resource.public_id.includes('admin-menu')
    );
    
    const menuImages = resources
      .filter((resource: CloudinaryResource) => /menu\/menu\d+$/.test(resource.public_id))
      .sort((a: CloudinaryResource, b: CloudinaryResource) => {
        // Seřadíme podle čísla v názvu
        const aMatch = a.public_id.match(/\d+$/);
        const bMatch = b.public_id.match(/\d+$/);
        const aNum = aMatch ? parseInt(aMatch[0]) : 0;
        const bNum = bMatch ? parseInt(bMatch[0]) : 0;
        return aNum - bNum;
      });

    // Spojíme admin obrázek (pokud existuje) s menu obrázky a vracíme jejich URL
    const allImages = [
      ...(adminImage ? [adminImage.secure_url] : []),
      ...menuImages.map((resource: CloudinaryResource) => resource.secure_url)
    ];

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error('Chyba při načítání obrázků z Cloudinary:', error);
    return NextResponse.json({ images: [] });
  }
} 