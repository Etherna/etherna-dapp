import {
  updateGatewayHost,
  updateIndexHost,
  resetGatewayHost,
  resetIndexHost
} from "./hosts"
import { finishCropping, cropImage } from "./cropImage"

const enviromentActions = {
  updateGatewayHost,
  updateIndexHost,
  resetGatewayHost,
  resetIndexHost,
  finishCropping,
  cropImage,
}

export default enviromentActions
