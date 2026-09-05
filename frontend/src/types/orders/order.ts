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
  createdAt: string
}

export interface OrderDetail {
  id: string
  total: number
  createdAt: string
  items: OrderItem[]
}
