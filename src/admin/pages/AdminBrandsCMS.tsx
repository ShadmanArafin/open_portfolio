'use client';

import React, { useState } from 'react';
import { TextInput } from '../components/AdminFields';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { firstSortOrder } from '../utils/listOps';
import { useCMS } from '../../cms/context/CMSContext';
import { AdminImageField } from '../components/AdminImageField';
import { BrandItem } from '../../cms/types/cms';
import { AstryxHeader, AstryxCard, AstryxButton } from '../components/astryx/AstryxComponents';
import { Plus, Trash2, Eye, EyeOff, Save, Check } from 'lucide-react';

export const AdminBrandsCMS: React.FC = () => {
  const { draftData, updateDraft, uploadMedia } = useCMS();
  const [isSaved, setIsSaved] = useState(false);

  const brands = [...draftData.brands].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddBrand = () => {
    const newBrand: BrandItem = {
      id: `brand-${Date.now()}`,
      name: 'New client',
      // Empty, not Apex's logo.
      logo: '',
      alt: '',
      size: 'default',
      sortOrder: firstSortOrder(brands),
      visible: true,
    };
    updateDraft((draft) => {
      draft.brands.unshift(newBrand);
    });
  };

  const handleRemoveBrand = (id: string) => {
    updateDraft((draft) => {
      draft.brands = draft.brands.filter((b) => b.id !== id);
    });
  };

  const handleBrandChange = (id: string, field: keyof BrandItem, value: any) => {
    updateDraft((draft) => {
      const b = draft.brands.find((item) => item.id === id);
      if (b) {
        (b as any)[field] = value;
      }
    });
  };

  const handleLogoFileUpload = async (id: string, file: File) => {
    if (!file) return;
    const brandName = draftData.brands.find((b) => b.id === id)?.name ?? 'Brand';
    const media = await uploadMedia(file, { altText: `${brandName} logo` });
    if (media) handleBrandChange(id, 'logo', media.url);
  };

  const handleSaveAll = () => {
    updateDraft((draft) => {
      draft.lastSavedAt = new Date().toISOString();
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <VStack gap={6}>
      {/* Astryx Header */}
      <AstryxHeader
        badgeText="Brands"
        title={`Clients & logos (${brands.length})`}
        subtitle="The logos shown in the strip on your homepage. Clients, tools, publications — whatever fits your field."
      >
        <AstryxButton variant="primary" icon={Plus} onClick={handleAddBrand}>
          Add Brand
        </AstryxButton>
      </AstryxHeader>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg2:grid-cols-4 gap-4 sm:gap-6">
        {brands.map((brand) => (
          <AstryxCard key={brand.id} variant="default" density="compact" className="space-y-4">
            <AdminImageField
              src={brand.logo}
              alt={brand.name}
              size="logo"
              fit="contain"
              buttonLabel="Upload logo"
              onFile={(file) => handleLogoFileUpload(brand.id, file)}
            />

            {/* Brand Fields */}
            <VStack gap={3}>
              <TextInput
                label="Brand name"
                value={brand.name}
                onChange={(_value, e) => handleBrandChange(brand.id, 'name', e.target.value)}
                width="100%"
              />

              <HStack gap={2} justify="between" align="center">
                <Button
                  label={brand.visible ? 'Visible' : 'Hidden'}
                  variant="ghost"
                  size="sm"
                  icon={brand.visible ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                  onClick={() => handleBrandChange(brand.id, 'visible', !brand.visible)}
                />

                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 aria-hidden />}
                  onClick={() => handleRemoveBrand(brand.id)}
                />
              </HStack>
            </VStack>
          </AstryxCard>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <AstryxButton variant="primary" icon={isSaved ? Check : Save} onClick={handleSaveAll}>
          {isSaved ? 'Saved' : 'Save brands'}
        </AstryxButton>
      </div>
    </VStack>
  );
};
