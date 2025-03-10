import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from '@/components/LanguageSelector';
import { Settings as SettingsIcon, Globe } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          {t('nav.settings')}
        </h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSelector />
              <p className="text-sm text-muted-foreground mt-2">
                {t('settings.languageDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 