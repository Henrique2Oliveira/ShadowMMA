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
};

interface MemoizedComboCardProps {
  item: ComboMeta;
  userLevel: number;
  onPress: (item: ComboMeta, isLocked: boolean) => void;
}

const MemoizedComboCard = ({ item, userLevel, onPress }: MemoizedComboCardProps) => {
  const isLocked = item.level > userLevel;

  return (
    <ComboCard
      id={item.id}
      name={item.name}
      level={item.level}
      type={item.type}
      categoryName={item.categoryName}
      comboId={item.comboId}
      isLocked={isLocked}
      onPress={() => onPress(item, isLocked)}
    />
  );
};

export default memo(MemoizedComboCard);
