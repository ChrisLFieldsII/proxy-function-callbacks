import cuid from 'cuid'

interface CartItem {
  id: string
  name: string
  price: number
}

interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number // in cents
  isEmpty: boolean
}

interface ICartClient {
  getCart: () => Cart
  addItem: (item: CartItem) => Cart
  removeItem: (id: string) => Cart
}

// export class Cart implements ICart {
//   items: CartItem[] = []

//   getItems = () => this.items

//   addItem = (item: Omit<CartItem, 'id'>) => {
//     this.items = this.items.concat({ ...item, id: cuid() })
//     return this.items
//   }

//   removeItem = (id: string) => {
//     this.items = this.items.filter(item => item.id !== id)
//     return this.items
//   }
// }
