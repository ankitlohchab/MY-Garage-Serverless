/**
 * Fields in a request to update a single VEHICLE item.
 */
export interface UpdateVehicleRequest {
  vehicleNumber: string
  insuranceExpiry: string
  insuranceValid: boolean
}