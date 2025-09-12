import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShoppingSelectionContextType {
  selectedShoppingItems: string[];
  setSelectedShoppingItems: (items: string[]) => void;
  clearSelection: () => void;
}

const ShoppingSelectionContext = createContext<ShoppingSelectionContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const ShoppingSelectionProvider: React.FC<Props> = ({ children }) => {
  const [selectedShoppingItems, setSelectedShoppingItems] = useState<string[]>([]);

  const clearSelection = () => {
    setSelectedShoppingItems([]);
  };

  return (
    <ShoppingSelectionContext.Provider 
      value={{ 
        selectedShoppingItems, 
        setSelectedShoppingItems, 
        clearSelection 
      }}
    >
      {children}
    </ShoppingSelectionContext.Provider>
  );
};

export const useShoppingSelection = (): ShoppingSelectionContextType => {
  const context = useContext(ShoppingSelectionContext);
  if (!context) {
    throw new Error('useShoppingSelection must be used within a ShoppingSelectionProvider');
  }
  return context;
};