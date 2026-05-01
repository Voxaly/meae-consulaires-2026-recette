/**
 * Copyright 2025 Voxaly Docaposte
 */

import {ReactNode} from "react";
import {createModal} from "@codegouvfr/react-dsfr/Modal";
import {ModalProps as ModalComponentProps} from "@codegouvfr/react-dsfr/Modal/Modal";
import {getText} from "../utils/utils";
import {useGlobal} from "../hooks/useGlobal";

interface DSFRModalProps {
    id: string;
    isOpenedByDefault: boolean;
    open: () => void;
    close: () => void;
    Component: (props: ModalComponentProps) => ReactNode;
}

interface VoxModalProps {
    modalParams: ReturnType<typeof createModal>; // Utiliser les objets "logoutModal" ou "timeoutModal" en bas de ce fichier
    title: ModalComponentProps['title'];
    icon?: ModalComponentProps['iconId'];
    buttons?: ModalComponentProps['buttons'];
    children: ModalComponentProps['children'];
}

const VoxModal = (props: VoxModalProps) => {
    const {modalParams, title, icon, buttons, children} = props;

    return (
        <modalParams.Component title={title} iconId={icon} buttons={buttons}>
            {children}
        </modalParams.Component>
    );
};

export const VoxModalLogout = () => {
    const {globalData} = useGlobal();

    return (
        <VoxModal
            modalParams={logoutModal}
            title={getText('modale.deconnexion.titre', globalData?.header.textes)}
            buttons={[
                {
                    children: getText('modale.deconnexion.bouton.oui', globalData?.header.textes),
                    doClosesModal: true,
                    onClick: () => {
                        window.location.href = '/logout';
                    },
                },
                {
                    children: getText('modale.deconnexion.bouton.non', globalData?.header.textes),
                    doClosesModal: true,
                }
            ]}
        >
            <p>{getText('modale.deconnexion.description', globalData?.header.textes)}</p>
        </VoxModal>
    )
}


/**
 * Params de la modale de déconnexion
 */
export const logoutModal = createModal({
    id: "logout-modal",
    isOpenedByDefault: false,
});

/**
 * Params de la modale d'inactivité
 */
export const timeoutModal = createModal({
    id: "timeout-modal",
    isOpenedByDefault: false,
});

/**
 * Params de la modale de code de confirmation non reçu (page ConfirmationVote)
 */
export const activationCodeModal = createModal({
    id: "activation-code-modal",
    isOpenedByDefault: false,
})

export default VoxModal;