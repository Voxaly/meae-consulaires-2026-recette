/**
 * Copyright 2025 Voxaly Docaposte
 */

import Stepper, {addStepperTranslations} from "@codegouvfr/react-dsfr/Stepper";
import {getText} from "../utils/utils";

interface VoxStepperProps {
    steps: { text: string, path: string }[],
    pos: number;
    textes: Record<string, string>;
}

const VoxStepper = (props: VoxStepperProps) => {
    const {steps, pos = 0, textes} = props;

    addStepperTranslations({
        lang: 'fr',
        messages: {
            "progress": (
                p) => getText('stepper.progression', textes,
                [p.currentStep, p.stepCount]
            ),
            "next step": getText('stepper.etape-suivante', textes),
        }
    })

    if (!steps.length) return null;

    return (
        <Stepper
            currentStep={pos + 1}
            stepCount={steps.length}
            title={steps[pos].text}
            nextTitle={steps[pos + 1]?.text}
        />
    );
};

export default VoxStepper;