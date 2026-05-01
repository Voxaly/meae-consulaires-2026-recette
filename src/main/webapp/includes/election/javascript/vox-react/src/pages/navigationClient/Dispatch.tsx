/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useNavigationClientContext} from "../../hooks/useNavigationClient";
import {Navigate} from "react-router-dom";
import {URL_TUNNEL_CHOIX_CANDIDAT, URL_TUNNEL_CHOIX_LISTE} from "../../config/const";

const Dispatch = () => {
    const {voteStatus} = useNavigationClientContext();

    const typeIHM = voteStatus.chosenElection?.typeEN.typeIhm;

    if (typeIHM === "NOM") {
        return <Navigate to={URL_TUNNEL_CHOIX_CANDIDAT} replace/>;
    } else if (typeIHM === "LSRCON") {
        return <Navigate to={URL_TUNNEL_CHOIX_LISTE} replace/>;
    } else return null;
};

export default Dispatch;