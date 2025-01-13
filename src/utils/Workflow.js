import { http } from './Utils';

export const fetchRentalLocations = async (workflowId = undefined) => {
  try {
    if (workflowId !== undefined) {
      const response = await http({
        url: `/clients/rentalLocation/enabled?workflow=${workflowId}`,
      });

      return response.rentalLocations;
    } else {
      const response = await http({ url: '/clients/rentalLocation/enabled' });
      return response.rentalLocations;
    }
  } catch (err) {
    console.error(err);
  }
};

const filterMovementTypeByWorkflow = async (workflowId) => {
  try {
    const response = await http({ url: `/workflow/${workflowId}` });

    const movementTypesAvailable = [];
    if (response?.configuration?.rentAvailable) {
      movementTypesAvailable.push({ label: 'Noleggio', value: 'NOL' });
    }
    if (response?.configuration?.comodatoAvailable) {
      movementTypesAvailable.push({ label: 'Comodato', value: 'COM' });
    }
    if (response?.configuration?.mnpAvailable) {
      movementTypesAvailable.push({ label: 'Movimento non produttivo', value: 'MNP' });
    }
    return movementTypesAvailable;
  } catch (err) {
    console.error(err);
  }
};

export const updateWorkflowParams = async (workflowId) => {
  try {
    const rentalLocations = await fetchRentalLocations(workflowId);
    const movementTypes = await filterMovementTypeByWorkflow(workflowId);

    return { rentalLocations, movementTypes };
  } catch (err) {
    console.error(err);
  }
};
