/**
 * Copyright 2025 Voxaly Docaposte
 */

import {FormEvent, useCallback, useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Button from "@codegouvfr/react-dsfr/Button";
import VoxMain from "../components/VoxMain";
import VoxCaptcha, {CaptchaData} from "../components/VoxCaptcha";
import {getText} from "../utils/utils";
import {CAPTCHA_REGEX} from "../utils/regex.util";
import {useGetVerifierCachetData, usePostVerifierCachet} from "../hooks/useVerifierCachet";
import {VerifierCachetResult} from "../models/pages/verifierCachet.model";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {URL_VERIFIER_CACHET} from "../config/const";

const VerifierCachet = () => {
    const [searchParams] = useSearchParams();
    const cachetParam = searchParams.get('cachetServeur') || undefined;

    const {data, isLoading} = useGetVerifierCachetData(cachetParam);
    const textes = data?.textes;

    useDocumentTitle(getText('verifier-cachet.titre-onglet', textes));

    // --- Formulaire --- //
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [cachetElectronique, setCachetElectronique] = useState<string>('');
    const [captcha, setCaptcha] = useState<CaptchaData>({captchaId: '', value: ''});
    const [captchaReady, setCaptchaReady] = useState<boolean>(false);
    const [captchaKey, setCaptchaKey] = useState<number>(0);
    const [resultat, setResultat] = useState<VerifierCachetResult | null>(null);

    const captchaRef = useRef<any>();

    // Initialisation
    useEffect(() => {
        if (data?.cachetServeur) {
            setCachetElectronique(data.cachetServeur);
        }
    }, [data]);

    // Captcha init
    useEffect(() => {
        setCaptchaReady(false);
        setCaptchaKey(prev => prev + 1);
        const timer = setTimeout(() => setCaptchaReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (captchaReady && captchaRef.current && captcha.captchaId === '') {
            const captchaId = captchaRef.current.getCaptchaId();
            if (captchaId) {
                setCaptcha(prev => ({...prev, captchaId}));
            } else {
                const retryTimer = setTimeout(() => {
                    if (captchaRef.current) {
                        const retryId = captchaRef.current.getCaptchaId();
                        if (retryId) {
                            setCaptcha(prev => ({...prev, captchaId: retryId}));
                        }
                    }
                }, 500);
                return () => clearTimeout(retryTimer);
            }
        }
    }, [captchaReady, captcha.captchaId]);

    const {mutate: postVerifier, isPending} = usePostVerifierCachet({
        onSuccess: (response) => {
            setResultat(response.data);
            resetCaptcha();
        },
        onError: () => {
            setErrors({global: 'Une erreur est survenue.'});
            resetCaptcha();
        }
    });

    const resetCaptcha = () => {
        if (captchaRef.current) {
            captchaRef.current.resetCaptcha();
            setCaptcha(prev => ({...prev, value: ''}));
            setTimeout(() => {
                const newCaptchaId = captchaRef.current?.getCaptchaId();
                if (newCaptchaId) {
                    setCaptcha(prev => ({...prev, captchaId: newCaptchaId}));
                }
            }, 1000);
        }
    };

    const isFormValid = useCallback(() => {
        return cachetElectronique.trim().length > 0 && captcha.value.length >= 4;
    }, [cachetElectronique, captcha.value]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setResultat(null);
        postVerifier({
            form: {
                cachetElectronique: cachetElectronique.trim(),
                captchaId: captchaRef.current ? captchaRef.current.getCaptchaId() : '',
                captchaDefi: captcha.value,
            }
        });
    };

    const handleReset = () => {
        window.location.href = URL_VERIFIER_CACHET;
    };

    if (isLoading) return null;

    return (
        <VoxMain type="colonne">
            {/* Titre */}
            <h1 className="fr-h4">{getText('verification.cachet.serveur.welcome', textes)}</h1>
            <p>{getText('verification.cachet.serveur.help.explainer', textes)}</p>

            <div className="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-9 fr-col-lg-8">

                        {/* Zone de résultat */}
                        {resultat && !resultat.erreurCode && (
                            <div className="fr-mb-5w">
                                <h2 className="fr-h4 fr-mt-2w">{getText('verification.cachet.serveur.result.title', textes)}</h2>

                                {resultat.exceptionMessage ? (
                                    <div className="fr-alert fr-alert--error fr-mb-5w">
                                        <p>{resultat.exceptionMessage}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Résultat vérification de la signature */}
                                        <div className={`fr-alert ${resultat.signatureValid ? 'fr-alert--success' : 'fr-alert--error'} fr-mb-2w`}>
                                            <p>{getText(resultat.signatureValid
                                                ? 'verification.cachet.serveur.result.signature.valid'
                                                : 'verification.cachet.serveur.result.signature.invalid', textes)}</p>
                                        </div>

                                        {/* Résultat vérification de la présence du bulletin dans l'urne */}
                                        <div className={`fr-alert ${resultat.bulletinTrouve ? 'fr-alert--success' : 'fr-alert--error'} fr-mb-5w`}>
                                            <p>{getText(resultat.bulletinTrouve
                                                ? 'verification.cachet.serveur.result.bulletin.valid'
                                                : 'verification.cachet.serveur.result.bulletin.invalid', textes)}</p>
                                        </div>

                                        {resultat.empreinteSHA256 && (
                                            <div>
                                                <p>{getText('verification.cachet.serveur.result.content.title', textes)}</p>
                                                Empreinte du bulletin : <strong>{resultat.empreinteSHA256}</strong>
                                            </div>
                                        )}
                                    </>
                                )}
                                <hr/>
                            </div>
                        )}

                        {/* Erreur captcha ou globale */}
                        {resultat?.erreurCode && (
                            <div className="fr-alert fr-alert--error fr-mb-2w" role="alert">
                                <p>{getText(resultat.erreurCode, textes)}</p>
                            </div>
                        )}
                        {errors['global'] && (
                            <div className="fr-alert fr-alert--error fr-mb-2w" role="alert">
                                <p>{errors['global']}</p>
                            </div>
                        )}

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit}>
                            <fieldset className="fr-fieldset" aria-labelledby="cachet-form-legend">
                                <legend id="cachet-form-legend" className="fr-fieldset__legend">
                                    <h2 className="fr-h5">
                                        {getText('verification.cachet.serveur.cachet.title', textes)}
                                    </h2>
                                </legend>

                                {/* Description */}
                                <div className="fr-fieldset__element">
                                    <p className="fr-text--sm">
                                        {getText('verification.cachet.serveur.cachet.explainer1', textes)}
                                    </p>
                                </div>

                                {/* Textarea cachet */}
                                <div className="fr-fieldset__element">
                                    <div className="fr-input-group">
                                        <textarea
                                            id="cachetElectronique"
                                            className="fr-input"
                                            rows={5}
                                            cols={33}
                                            placeholder="Coller le cachet électronique..."
                                            value={cachetElectronique}
                                            onChange={(e) => setCachetElectronique(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Captcha */}
                                <div className="fr-fieldset__element">
                                    {captchaReady && (
                                        <VoxCaptcha
                                            key={captchaKey}
                                            instructions={getText('identification.compte.champ.captcha.description', textes)}
                                            {...captcha}
                                            ref={captchaRef}
                                            inputProps={{
                                                id: "",
                                                errors,
                                                setErrors,
                                                regex: CAPTCHA_REGEX,
                                                texts: {
                                                    label: getText('identification.compte.champ.captcha.label', textes),
                                                    description: getText('identification.compte.champ.captcha.aide', textes),
                                                    errorIsEmpty: getText('identification.compte.champ.captcha.erreur.vide', textes),
                                                    errorFormat: getText('identification.compte.champ.captcha.erreur.format', textes),
                                                },
                                                onChange: (e) => setCaptcha(prev => ({...prev, value: e.target.value})),
                                                nativeInputProps: {
                                                    value: captcha.value,
                                                    required: true,
                                                    maxLength: 4,
                                                    autoComplete: "off",
                                                }
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Boutons */}
                                <div className="fr-fieldset__element">
                                    <ul className="fr-btns-group">
                                        <li>
                                            <Button
                                                id="submitBtn"
                                                className="fr-btn fr-mt-2v"
                                                disabled={isPending || !isFormValid()}
                                            >
                                                {getText('verification.cachet.serveur.validate', textes)}
                                            </Button>
                                        </li>
                                        <li>
                                            <Button
                                                type="button"
                                                className="fr-btn fr-mt-2v fr-btn--secondary"
                                                onClick={handleReset}
                                            >
                                                {getText('action.rafraichir', textes) || 'Rafraîchir'}
                                            </Button>
                                        </li>
                                    </ul>
                                </div>
                            </fieldset>
                        </form>

                    </div>
                </div>
            </div>
        </VoxMain>
    );
};

export default VerifierCachet;