import React, { memo } from 'react';
import ComboCard from './ComboCard';

type ComboMeta = {
  id: string;
  name: string;
  level: number;
  type?: string;
  categoryId: string;
  categoryName?: string;
  comboId?: number | string;
  proOnly?: boolean;
};

interface MemoizedComboCardProps {
  item: ComboMeta;
  userLevel: number;
  onPress: (item: ComboMeta, isLocked: boolean) => void;
  isFreePlan?: boolean;
  onUpgradePress?: (item: ComboMeta) => void;
}

const MemoizedComboCard = ({ item, userLevel, onPress, isFreePlan = false, onUpgradePress }: MemoizedComboCardProps) => {
  // Only lock by level. Pro-only on free plan should not disable press; we'll show upgrade CTA instead.
  const isLocked: boolean = (item.level > userLevel);

  return (
    <ComboCard
      id={item.id}
      name={item.name}
      level={item.level}
      type={item.type}
      categoryName={item.categoryName}
      comboId={item.comboId}
      isLocked={isLocked}
      proOnly={item.proOnly}
      isFreePlan={isFreePlan}
      onUpgradePress={onUpgradePress ? () => onUpgradePress(item) : undefined}
      onPress={() => onPress(item, isLocked)}
    />
  );
};

export default memo(MemoizedComboCard);
