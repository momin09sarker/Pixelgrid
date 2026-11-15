import React from 'react';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ArrowRight, Smartphone, Laptop, Headphones, Watch, Gamepad2, Camera } from 'lucide-react';

interface CategorySectionProps {
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Watch: <Watch className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
};

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  const categories = api.getCategories();
  const { language, t } = useLanguage();

  return (
    <section className="py-16 bg-slate-950 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              Top Hardware Departments
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 transition-colors"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-950 mb-3 relative p-2">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-slate-900/90 text-cyan-400 border border-slate-700/50 shadow-md">
                  {CATEGORY_ICONS[cat.icon] || <Smartphone className="w-4 h-4" />}
                </div>
              </div>

              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {language === 'bn' && cat.nameBn ? cat.nameBn : cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cat.itemCount} Flagship Items
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
