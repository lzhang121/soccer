import { PROVIDERS, type AiProvider } from '@/lib/ai';
import type { AiSettings } from '@/lib/ai/types';

interface ProviderSwitcherProps {
  settings: AiSettings;
  onChange: (provider: AiProvider) => void;
}

export function ProviderSwitcher({ settings, onChange }: ProviderSwitcherProps) {
  return (
    <div className="provider-switcher card card--glass">
      <label className="provider-switcher__label" htmlFor="quick-provider">
        AI
      </label>
      <select
        id="quick-provider"
        className="provider-switcher__select"
        value={settings.provider}
        onChange={(e) => onChange(e.target.value as AiProvider)}
      >
        {PROVIDERS.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.label}
          </option>
        ))}
      </select>
    </div>
  );
}
