export interface OrderStatus{
  orderId?: string
  quotationId?:string
  customerName?: string
  address?: string
  telephone?: string
  productName?: string
  allTotalPrice?: number
  paidPrice?: number
  unPaidPrice?: number
  remark?: string
  paidRemark?: string
  createTime?: string
}
