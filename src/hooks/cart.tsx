import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsList = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsList) setProducts(JSON.parse(productsList));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      let productsList = [...products];

      if (!products.find(element => element.id === product.id)) {
        productsList = [...products, { ...product, quantity: 1 }];
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsList),
      );

      setProducts(productsList);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const producsList = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }

        return product;
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(producsList),
      );

      setProducts(producsList);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const producsList = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity - 1 < 0 ? 0 : product.quantity - 1,
          };
        }

        return product;
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(producsList),
      );

      setProducts(producsList);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
