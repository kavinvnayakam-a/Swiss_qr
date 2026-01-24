export interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  imageHint: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Received' | 'Preparing' | 'Served' | 'Completed';
  timestamp: number;
}
