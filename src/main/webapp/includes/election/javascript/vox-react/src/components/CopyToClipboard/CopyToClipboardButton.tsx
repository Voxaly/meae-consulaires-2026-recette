/**
 * Copyright 2025 Voxaly Docaposte
 */

import './copyToClipboard.css';
import React, {useState} from "react";
import Button from "@codegouvfr/react-dsfr/Button";

interface CopyToClipboardProps {
    contentToCopy: string;
    textButton: string;
    textTooltip: string;
}

export const CopyToClipboardButton = (props: CopyToClipboardProps) => {
    const {contentToCopy, textButton, textTooltip} = props;

    const tooltipId = "copy-confirmation-tooltip";

    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        navigator.clipboard.writeText(contentToCopy.trim()).then(() => {
            setShowTooltip(true)
            setTimeout(() => setShowTooltip(false), 4000);
        });
    };

    return (
        <div className="vox-copy-paste">
            <p className="content fr-m-0">{contentToCopy}</p>

            <Button
                title={textButton}
                iconId={"fr-icon-file-copy-line" as any}
                priority="tertiary no outline"
                onClick={(e) => onClick(e)}
                aria-describedby={tooltipId}
                aria-haspopup
            />

            {showTooltip && (
                <span id={tooltipId} className="success-copy" role="tooltip">
                    {textTooltip}
                </span>
            )}
        </div>
    );
};

export default CopyToClipboardButton;