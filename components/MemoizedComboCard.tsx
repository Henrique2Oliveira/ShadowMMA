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
}

const MemoizedComboCard = ({ item, userLevel, onPress, isFreePlan = false }: MemoizedComboCardProps) => {
  const isLocked: boolean = (item.level > userLevel) || (!!item.proOnly && isFreePlan);

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
      onPress={() => onPress(item, isLocked)}
    />
  );
};

export default memo(MemoizedComboCard);
