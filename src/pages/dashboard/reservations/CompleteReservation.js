import React from "react"
import SimpleReservation from "../../../components/Reservations/ReservationTypes/SimpleReservation";
import Page from '../../../components/Dashboard/Page';
import { CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR } from '../../../utils/Utils';
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

const CompleteReservation = () => {
  const searchString = useLocation().search;
  const searchParams = Object.fromEntries(new URLSearchParams(searchString).entries());

  return (
    <Page canAccess={[CLIENT_ROLE_ADMIN, CLIENT_ROLE_OPERATOR]} bodyClassName={'pb-4'}>
      <SimpleReservation pageTitle="Completa prenotazione" activeStep={2} {...{searchParams, searchString}} />
    </Page>
  )
}

export default CompleteReservation;