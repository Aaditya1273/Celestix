import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="relative bg-black pt-24 pb-12 px-6 border-t border-white/5 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-black gradient-text tracking-tighter mb-6 block w-fit">
              CELESTIX
            </Link>
            <p className="text-white/40 text-lg max-w-sm mb-8 leading-relaxed">
              Crafting the next generation of digital experiences with precision, performance, and passion.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-3 glass-effect rounded-full text-white/50 hover:text-white transition-all hover:scale-110">
                <FiGithub className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-3 glass-effect rounded-full text-white/50 hover:text-white transition-all hover:scale-110">
                <FiTwitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-3 glass-effect rounded-full text-white/50 hover:text-white transition-all hover:scale-110">
                <FiLinkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="/text-animations/text-devider" className="text-white/40 hover:text-white transition-colors">Components</Link></li>
              <li><Link href="/showcase" className="text-white/40 hover:text-white transition-colors">Showcase</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white transition-colors">GitHub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"><FiMail className="w-4 h-4" /> Support</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white transition-colors">Hire Us</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-white/40 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-sm font-medium">
            © {new Date().getFullYear()} Celestix. All rights reserved.
          </p>
          <div className="flex gap-8">
            <p className="text-white/20 text-sm">
              Crafted by <span className="text-white/40 font-bold">David Haz</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;