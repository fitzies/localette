"use client";

import { useState, useCallback } from "react";

interface UseCharacterLimitProps {
  maxLength: number;
  initialValue?: string;
}

interface UseCharacterLimitReturn {
  value: string;
  characterCount: number;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  maxLength: number;
  setValue: (value: string) => void;
}

export function useCharacterLimit({
  maxLength,
  initialValue = "",
}: UseCharacterLimitProps): UseCharacterLimitReturn {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setValue(newValue);
      }
    },
    [maxLength]
  );

  return {
    value,
    characterCount: value.length,
    handleChange,
    maxLength,
    setValue,
  };
}
