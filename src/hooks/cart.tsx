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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@gomarcketplace:products');

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@gomarcketplace:products',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(prod => prod.id === product.id);

      if (productIndex >= 0) {
        increment(product.id);
      } else {
        const newProduct = { ...product, quantity: 1 };

        setProducts(oldState => [...oldState, newProduct]);
      }
    },
    [increment, products],
  );

  const increment = useCallback(
    async id => {
      const newProducs = products.map(prod => ({
        ...prod,
        quantity: prod.id === id ? prod.quantity + 1 : prod.quantity,
      }));

      setProducts(newProducs);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducs = products.map(prod => ({
        ...prod,
        quantity:
          prod.id === id && prod.quantity > 0
            ? prod.quantity - 1
            : prod.quantity,
      }));

      setProducts(newProducs);
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
