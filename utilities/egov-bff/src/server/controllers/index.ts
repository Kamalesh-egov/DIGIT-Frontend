import ProcessMicroplanController from "./processMicroplan/ProcessMicroplanController.controller";
import TransformController from "./bulkTransform/TransformController.controller";
import { listener } from '../Kafka/Listener';
import genericAPIController from "./genericAPIService/GenericAPIController.controller";
import campaignManageController from "./campaignManage/campaignManage.controller";

// Call the listener function to start consuming messages
listener();

const controllers = [
  new ProcessMicroplanController(),
  new TransformController(),
  new genericAPIController(),
  new campaignManageController()
]

export default controllers;