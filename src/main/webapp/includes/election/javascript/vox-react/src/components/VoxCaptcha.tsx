/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Captcha, captchaSettings} from 'reactjs-captcha';
import React, {forwardRef, useImperativeHandle, useRef} from "react";
import DSFRInput, {DSFRInputProps} from "./DSFRInput";
import {ReactJSCaptcha} from "../models/global.model";

export interface CaptchaData {
    captchaId: string;
    value: string;
}

interface CaptchaProps {
    instructions?: string;
    inputProps: DSFRInputProps;
}

const VoxCaptcha = forwardRef((props: CaptchaProps & CaptchaData, ref) => {
    const {instructions, inputProps, value} = props;
    const {errors} = inputProps;

    const captchaRef = useRef<ReactJSCaptcha | null>(null);

    // Variables définies dans botdetect.xml
    const userInputID = 'captchaDefi';
    const captchaStyleName = 'captchaFR';

    captchaSettings.set({captchaEndpoint: '/simple-captcha-endpoint'});

    const resetCaptcha = () => {
        if (captchaRef.current) {
            captchaRef.current.reloadImage();
            captchaRef.current.getCaptchaId();
        }
    }

    // Hook permettant d'exposer des données au composant parent
    useImperativeHandle(ref, () => ({
        resetCaptcha,
        getCaptchaId: () => {
            try {
                return captchaRef.current?.getCaptchaId() ?? '';
            } catch {
                return '';
            }
        },
    }))

    return (
        <div className={`captcha fr-input-group ${errors?.[userInputID] && 'fr-input-group--error'}`}>
            <div className="captcha-top">
                <Captcha
                    ref={(el: unknown) => (captchaRef.current = el as ReactJSCaptcha)}
                    id={'identificationCaptcha'}
                    captchaStyleName={captchaStyleName}
                />
                {instructions && (
                    <p className="fr-hint-text fr-mt-2w" dangerouslySetInnerHTML={{__html: instructions}}/>
                )}
            </div>
            <div className="captcha-bottom">
                <DSFRInput {...inputProps} id={userInputID}/>
            </div>
        </div>
    );
});

export default VoxCaptcha;