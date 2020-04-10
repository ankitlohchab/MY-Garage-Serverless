import { apiEndpoint } from '../config'
import { Vehicle } from '../types/Vehicle';
import { CreateVehicleRequest } from '../types/CreateVehicleRequest';
import Axios from 'axios'
import { UpdateVehicleRequest } from '../types/UpdateVehicleRequest';

export async function getVehicles(idToken: string): Promise<Vehicle[]> {
  console.log('Fetching Vehicles')

  const response = await Axios.get(`${apiEndpoint}/vehicles`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Vehicles:', response.data)
  return response.data.items
}

export async function createVehicle(
  idToken: string,
  newVehicle: CreateVehicleRequest
): Promise<Vehicle> {
  const response = await Axios.post(`${apiEndpoint}/vehicles`,  JSON.stringify(newVehicle), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchVehicle(
  idToken: string,
  vehicleId: string,
  updatedVehicle: UpdateVehicleRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/vehicles/${vehicleId}`, JSON.stringify(updatedVehicle), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteVehicle(
  idToken: string,
  vehicleId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/vehicles/${vehicleId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  vehicleId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/vehicles/${vehicleId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
