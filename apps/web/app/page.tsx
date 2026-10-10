import { HeroSection } from './components/landing/HeroSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { SocialProofSection } from './components/landing/SocialProofSection';
import { CTADownloadSection } from './components/landing/CTADownloadSection';
import { FooterSection } from './components/landing/FooterSection';

interface LandingConfig {
  hero?: any;
  features?: any;
  'social-proof'?: any;
  'cta-download'?: any;
  footer?: any;
}

async function getLandingConfig(): Promise<any> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ticket-ar.netlify.app';
    const res = await fetch(`${baseUrl}/api/landing`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch landing config');
    const data = await res.json();
    return data.config || {};
  } catch (error) {
    console.error('Error fetching landing config:', error);
    return {};
  }
}

export default async function Home() {
  const config = await getLandingConfig();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-white)' }}>
      {config.hero && <HeroSection data={config.hero} />}
      {config.features && <FeaturesSection data={config.features} />}
      {config['social-proof'] && <SocialProofSection data={config['social-proof']} />}
      {config['cta-download'] && <CTADownloadSection data={config['cta-download']} />}
      {config.footer && <FooterSection data={config.footer} />}
    </main>
  );
}