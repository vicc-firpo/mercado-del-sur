export interface OrderItem {
  productName: string
  productDescription: string | null
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface OrderSummary {
  id: string
  total: number
  itemCount: number
  isPaid: boolean
  createdAt: string
}

export interface OrderDetail {
  id: string
  total: number
  isPaid: boolean
  createdAt: string
  items: OrderItem[]
}
