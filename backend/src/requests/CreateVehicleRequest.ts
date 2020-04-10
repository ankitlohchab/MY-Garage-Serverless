/**
 * Fields in a request to create a single VEHICLE item.
 */
export interface CreateVehicleRequest {
  vehicleNumber: string
  insuranceExpiry: string
  insuranceValid: boolean
  createdAt: string
  attachmentUrl: string
}
