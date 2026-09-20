import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem('appLanguage', code);
    } catch {
      // localStorage unavailable (private mode, storage disabled) - language still switches for this session
    }
    document.activeElement?.blur();
  };

  const current = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case">
        <Globe size={16} />
        <span className="font-medium">{current.label}</span>
      </label>
      <ul tabIndex={0} className="dropdown-content menu menu-sm bg-base-100 rounded-box shadow-lg border border-base-200 mt-3 w-36 z-30 p-2">
        {LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <button
              type="button"
              onClick={() => handleChange(lang.code)}
              className={lang.code === i18n.language ? 'active bg-primary text-primary-content font-semibold' : 'font-medium'}
            >
              {lang.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
