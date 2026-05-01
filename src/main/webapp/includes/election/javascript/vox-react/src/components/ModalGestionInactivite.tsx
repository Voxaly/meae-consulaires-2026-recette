/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {useEffect, useRef, useState} from "react";
import VoxModal, {timeoutModal} from "./VoxModal";
import {useGlobal} from "../hooks/useGlobal";
import {getText} from "../utils/utils";
import {useSession} from "../hooks/useSession";

interface ModalGestionInactiviteProps {
    delaiAffichagePopIn: number;
    delaiChoixPopIn: number;
    delaisSurcis: number;
}

const ModalGestionInactivite = (props: ModalGestionInactiviteProps) => {
    const {delaiChoixPopIn, delaiAffichagePopIn, delaisSurcis} = props;

    const {globalData} = useGlobal();
    const {data: sessionData} = useSession();
    const isConnected = sessionData?.authenticated ?? false;

    const [compteur, setCompteur] = useState(Number(delaiAffichagePopIn));
    const [compteurModal, setCompteurModal] = useState<number>(Number(delaiChoixPopIn));
    const openedOnce = useRef(false);

    const logout = () => {
        sessionStorage.setItem('redirectError', JSON.stringify({
            message: 'ERR-ID-42',
            args: []
        }));
        window.location.href = '/logout';
        timeoutModal.close();
    }

    useEffect(() => {
        const handleUserActivity = () => {
            if (openedOnce.current) {
                setCompteur(Number(delaisSurcis));
            } else {
                setCompteur(Number(delaiAffichagePopIn));
            }
        };

        window.addEventListener('click', handleUserActivity);

        return () => {
            window.removeEventListener('click', handleUserActivity);
        };
    }, [delaiAffichagePopIn, delaisSurcis]);

    useEffect(() => {
        if (compteur <= 0 && isConnected) {
            timeoutModal.open();
            openedOnce.current = true;
            const modalTimer = setInterval(() => {
                setCompteurModal((prev) => {
                    if (prev <= 0) {
                        logout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(modalTimer);

        }
        const timer = setTimeout(() => {
            setCompteur((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);

    }, [compteur, logout]);

    return (
        <VoxModal
            modalParams={timeoutModal}
            title={getText('modale.inactivite.titre', globalData?.header.textes)}
            buttons={[
                {
                    children: getText('modale.inactivite.bouton.continuer', globalData?.header.textes),
                    doClosesModal: true,
                },
            ]}
        >
            <p>{getText('modale.inactivite.description', globalData?.header.textes, [delaisSurcis / 60])} {compteurModal} {getText('modale.inactivite.secondes', globalData?.header.textes)}</p>
        </VoxModal>
    );
};

export default ModalGestionInactivite;
