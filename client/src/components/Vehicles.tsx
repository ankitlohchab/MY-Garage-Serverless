import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createVehicle, deleteVehicle, getVehicles, patchVehicle } from '../api/vehicles-api'
import Auth from '../auth/Auth'
import { Vehicle } from '../types/Vehicle'

interface VehiclesProps {
  auth: Auth
  history: History
}

interface VehiclesState {
  vehicles: Vehicle[]
  newvehicleNumber: string
  loadingVehicles: boolean
}

export class Vehicles extends React.PureComponent<VehiclesProps, VehiclesState> {
  state: VehiclesState = {
    vehicles: [],
    newvehicleNumber: '',
    loadingVehicles: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newvehicleNumber: event.target.value })
  }

  onEditButtonClick = (vehicleId: string) => {
    this.props.history.push(`/vehicles/${vehicleId}/edit`)
  }

  onVehicleCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const insuranceExpiry = this.calculateInsuranceExpiry()
      const newVehicle = await createVehicle(this.props.auth.getIdToken(), {
        vehicleNumber: this.state.newvehicleNumber,
        insuranceExpiry
      })
      this.setState({
        vehicles: [...this.state.vehicles, newVehicle],
        newvehicleNumber: ''
      })
    } catch {
      alert('Vehicle creation failed')
    }
  }

  onVehicleDelete = async (vehicleId: string) => {
    try {
      await deleteVehicle(this.props.auth.getIdToken(), vehicleId)
      this.setState({
        vehicles: this.state.vehicles.filter(vehicle => vehicle.vehicleId != vehicleId)
      })
    } catch {
      alert('Vehicle deletion failed')
    }
  }

  onVehicleCheck = async (pos: number) => {
    try {
      const vehicle = this.state.vehicles[pos]
      await patchVehicle(this.props.auth.getIdToken(), vehicle.vehicleId, {
        vehicleNumber: vehicle.vehicleNumber,
        insuranceExpiry: vehicle.insuranceExpiry,
        insuranceValid: !vehicle.insuranceValid
      })
      this.setState({
        vehicles: update(this.state.vehicles, {
          [pos]: { insuranceValid: { $set: !vehicle.insuranceValid } }
        })
      })
    } catch {
      alert('Vehicle deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const vehicles = await getVehicles(this.props.auth.getIdToken())
      this.setState({
        vehicles,
        loadingVehicles: false
      })
    } catch (e) {
      alert(`Failed to fetch vehicles: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Garage</Header>

        {this.renderCreateVehicleInput()}

        {this.renderVehicles()}
      </div>
    )
  }

  renderCreateVehicleInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add Vehicle',
              onClick: this.onVehicleCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter Vehicle Registration Number"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderVehicles() {
    if (this.state.loadingVehicles) {
      return this.renderLoading()
    }

    return this.renderVehiclesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Vehicles
        </Loader>
      </Grid.Row>
    )
  }

  renderVehiclesList() {
    return (
      <Grid padded>
        {this.state.vehicles.map((vehicle, pos) => {
          return (
            <Grid.Row key={vehicle.vehicleId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onVehicleCheck(pos)}
                  checked={vehicle.insuranceValid}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {vehicle.vehicleNumber}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {vehicle.insuranceExpiry}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(vehicle.vehicleId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVehicleDelete(vehicle.vehicleId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {vehicle.attachmentUrl && (
                <Image src={vehicle.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateInsuranceExpiry(): string {
    const date = new Date()
    date.setDate(date.getDate() + 365)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
