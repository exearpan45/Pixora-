import landscapeImg from '../assets/images/sample_landscape_1790500381241.jpg';
import portraitImg from '../assets/images/sample_portrait_1790500397587.jpg';
import productImg from '../assets/images/sample_product_1790500409488.jpg';

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  description: string;
  src: string;
  fileName: string;
  defaultFormat: string;
  dimensions: string;
}

export const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'sample-landscape',
    title: 'Misty Alpine Ridge',
    category: 'Landscape & Detail',
    description: 'High dynamic range scene ideal for testing compression, clarity, and temperature.',
    src: landscapeImg,
    fileName: 'alpine_mist_golden_hour.jpg',
    defaultFormat: 'image/jpeg',
    dimensions: '1920 × 1080',
  },
  {
    id: 'sample-portrait',
    title: 'Studio Lighting Portrait',
    category: 'Portrait & Studio',
    description: 'Clean studio lighting portrait ideal for background removal, tint, and filters.',
    src: portraitImg,
    fileName: 'editorial_studio_portrait.jpg',
    defaultFormat: 'image/jpeg',
    dimensions: '1440 × 1080',
  },
  {
    id: 'sample-product',
    title: 'Artisanal Ceramic Dripper',
    category: 'Commercial Product',
    description: 'High-texture travertine setup ideal for square crop, web resize, and watermarking.',
    src: productImg,
    fileName: 'minimal_ceramic_dripper.jpg',
    defaultFormat: 'image/jpeg',
    dimensions: '1200 × 1200',
  },
];
