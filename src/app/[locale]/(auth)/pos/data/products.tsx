import type { Product } from '../context/cart-context';

export const products: Product[] = [
  {
    id: 4,
    name: 'Classic Burger',
    price: 12.99,
    image: '/classic-beef-burger.png',
    category: 'food',
  },
  {
    id: 5,
    name: 'Margherita Pizza',
    price: 15.99,
    image: '/delicious-pizza.png',
    category: 'food',
  },
  {
    id: 6,
    name: 'Caesar Salad',
    price: 8.99,
    image: '/vibrant-mixed-salad.png',
    category: 'food',
  },
  {
    id: 7,
    name: 'Chicken Wings',
    price: 10.99,
    image: '/crispy-chicken-wings.png',
    category: 'food',
  },
  {
    id: 8,
    name: 'French Fries',
    price: 4.99,
    image: '/crispy-french-fries.png',
    category: 'food',
  },
  {
    id: 11,
    name: 'Coca Cola',
    price: 2.99,
    image: '/refreshing-cola.png',
    category: 'drinks',
  },
  {
    id: 10,
    name: 'Latte Coffee',
    price: 4.50,
    image: '/latte-coffee.png',
    category: 'drinks',
  },
  {
    id: 9,
    name: 'Chocolate Cake',
    price: 6.99,
    image: '/chocolate-cake-slice.png',
    category: 'desserts',
  },
];
