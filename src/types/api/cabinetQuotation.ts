import type {CabinetQuotationDetail} from '@/types/api/cabinetQuotationDetail'

export interface CabinetQuotation{
  quotationId?: string
  customerName?: string
  address?: string
  telephone?: string
  productName?: string
  color?: string
  cabinetBody?: string
  quotationDate?: string
  cabinetTotalPrice?: number
  electricalTotalPrice?: number
  allTotalPrice?: number
  cabinetQuotationDetails?: CabinetQuotationDetail[]
}
