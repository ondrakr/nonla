import { NextResponse } from 'next/server';
import cloudinary from '@/app/lib/cloudinary';
import { promises as fs } from 'fs';
import path from 'path';

// Definice typů pro resource z Cloudinary
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  [key: string]: any;
}

// Funkce pro získání lokálních obrázků z public/menu
async function getLocalMenuImages(): Promise<string[]> {
  try {
    const menuDir = path.join(process.cwd(), 'public', 'menu');
    
    // Zkontrolujeme, zda složka existuje
    try {
      await fs.access(menuDir);
    } catch (error) {
      console.log(`Složka ${menuDir} neexistuje`);
      return [];
    }
    
    // Načteme soubory
    const files = await fs.readdir(menuDir);
    
    if (!files || files.length === 0) {
      return [];
    }
    
    // Filtrujeme pouze menu obrázky (ne admin-menu)
    const menuImages = files
      .filter(file => /^menu\d+\.(jpg|jpeg|png|gif)$/i.test(file))
      .sort((a, b) => {
        // Seřadíme podle čísla v názvu
        const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      })
      .map(file => `/menu/${file}`);
    
    return menuImages;
  } catch (error) {
    console.error('Chyba při načítání lokálních obrázků:', error);
    return [];
  }
}

export async function GET() {
  try {
    // 1. Získáme obrázky z Cloudinary
    let cloudinaryImages: string[] = [];
    let adminImage: CloudinaryResource | undefined;
    
    try {
      // Zkusíme najít všechny obrázky ve složce menu v Cloudinary
      const { resources } = await cloudinary.search
        .expression('folder:menu')
        .sort_by('public_id', 'asc')
        .max_results(100)
        .execute() as { resources: CloudinaryResource[] };
      
      console.log('Cloudinary resources:', JSON.stringify(resources, null, 2));
      
      if (resources && resources.length > 0) {
        // Najdeme admin-menu obrázek - pozor na správný public_id
        adminImage = resources.find((resource: CloudinaryResource) => 
          resource.public_id.endsWith('admin-menu')
        );
        
        if (adminImage) {
          console.log('Found admin image:', adminImage.public_id, adminImage.secure_url);
        } else {
          console.log('Admin image not found in resources');
          
          // Zkusíme najít admin-menu specificky, pokud nebyl nalezen výše
          try {
            const adminResult = await cloudinary.api.resource('menu/admin-menu');
            if (adminResult) {
              console.log('Found admin image by direct lookup:', adminResult.public_id);
              adminImage = adminResult as CloudinaryResource;
            }
          } catch (err) {
            console.error('Error getting admin image by direct lookup:', err);
          }
        }
        
        // Filtrujeme ostatní menu obrázky
        const menuCloudinaryImages = resources
          .filter((resource: CloudinaryResource) => /menu\/menu\d+$/.test(resource.public_id))
          .sort((a: CloudinaryResource, b: CloudinaryResource) => {
            const aMatch = a.public_id.match(/\d+$/);
            const bMatch = b.public_id.match(/\d+$/);
            const aNum = aMatch ? parseInt(aMatch[0]) : 0;
            const bNum = bMatch ? parseInt(bMatch[0]) : 0;
            return aNum - bNum;
          })
          .map((resource: CloudinaryResource) => resource.secure_url);
        
        cloudinaryImages = menuCloudinaryImages;
      }
    } catch (error) {
      console.error('Chyba při načítání obrázků z Cloudinary:', error);
      // Pokračujeme i když Cloudinary selže
    }
    
    // 2. Získáme lokální obrázky menu
    const localImages = await getLocalMenuImages();
    
    // 3. Spojíme všechny obrázky (nejprve admin obrázek, pak lokální a pak cloudinary)
    const allImages = [
      ...(adminImage ? [adminImage.secure_url] : []),
      ...localImages,
      ...cloudinaryImages
    ];

    // Log pro debug
    console.log('Vracím obrázky:', allImages);

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error('Chyba při načítání obrázků:', error);
    return NextResponse.json({ images: [] });
  }
} 