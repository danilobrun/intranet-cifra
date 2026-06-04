import {
  canAccessContracts,
  canManageAllContracts,
  userIsContractManager,
} from "./contractsPermissions";

export const canAccessBoletins = canAccessContracts;

export const canManageAllBoletins = canManageAllContracts;

export const userIsBoletimManager = userIsContractManager;
