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
import {useGetVerifierEmpreinteData, usePostVerifierEmpreinte} from "../hooks/useVerifierEmpreinte";
import {VerifierEmpreinteResult} from "../models/pages/verifierEmpreinte.model";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {URL_VERIFIER_EMPREINTE} from "../config/const";

const VerifierEmpreinte = () => {
    const [searchParams] = useSearchParams();
    const empreinteParam = searchParams.get('empreinte') || undefined;

    const {data, isLoading} = useGetVerifierEmpreinteData(empreinteParam);
    const textes = data?.textes;

    useDocumentTitle(getText('verifier-empreinte.titre-onglet', textes));

    // --- Formulaire --- //
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [empreinte, setEmpreinte] = useState<string>('');
    const [captcha, setCaptcha] = useState<CaptchaData>({captchaId: '', value: ''});
    const [captchaReady, setCaptchaReady] = useState<boolean>(false);
    const [captchaKey, setCaptchaKey] = useState<number>(0);
    const [resultat, setResultat] = useState<VerifierEmpreinteResult | null>(null);

    const captchaRef = useRef<any>();

    // Initialisation
    useEffect(() => {
        if (data?.empreinte) {
            setEmpreinte(data.empreinte);
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

    const {mutate: postVerifier, isPending} = usePostVerifierEmpreinte({
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
        return empreinte.trim().length > 0 && captcha.value.length >= 4;
    }, [empreinte, captcha.value]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setResultat(null);
        postVerifier({
            form: {
                empreinte: empreinte.trim(),
                captchaId: captchaRef.current ? captchaRef.current.getCaptchaId() : '',
                captchaDefi: captcha.value,
            }
        });
    };

    const handleReset = () => {
        window.location.href = URL_VERIFIER_EMPREINTE;
    };

    if (isLoading) return null;

    const isDepouillement = data?.isDepouillement === "true";
    const titre = isDepouillement
        ? getText('verification.empreinte.isDepouillement.titre', textes)
        : getText('verification.empreinte.titre', textes);

    return (
        <VoxMain type="colonne">
            {/* Titre */}
            <h1 className="fr-h4">{titre}</h1>
            <p>{getText('verification.empreinte.texte', textes)}</p>

            <div className="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-9 fr-col-lg-8">

                        {/* Zone de résultat */}
                        {resultat && (
                            <div className="fr-mb-5w">
                                {resultat.empreinteValide ? (
                                    <>
                                        <div className="fr-alert fr-alert--success fr-mb-3w">
                                            <p>
                                                {isDepouillement
                                                    ? getText('verification.empreinte.isDepouillement.texte.resultat.ok', textes)
                                                    : getText('verification.empreinte.texte.resultat.ok', textes)}
                                            </p>
                                        </div>
                                        {resultat.chiffrementSuffrage && (
                                            <div>
                                                <p>{getText('verification.empreinte.texte.suffrageChiffre', textes)} :</p>
                                                <strong>{resultat.chiffrementSuffrage}</strong>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="fr-alert fr-alert--error fr-mb-3w">
                                        <p>{getText(resultat.erreurCode || 'verification.empreinte.texte.resultat.ko', textes)}</p>
                                    </div>
                                )}
                                <hr/>
                            </div>
                        )}

                        {/* Erreur globale */}
                        {errors['global'] && (
                            <div className="fr-alert fr-alert--error fr-mb-2w" role="alert">
                                <p>{errors['global']}</p>
                            </div>
                        )}

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit}>
                            <fieldset className="fr-fieldset" aria-labelledby="empreinte-form-legend">
                                <legend id="empreinte-form-legend" className="fr-fieldset__legend">
                                    <h2 className="fr-h5">
                                        {getText('verification.empreinte.label.empreinte', textes)}
                                    </h2>
                                </legend>

                                {/* Input empreinte */}
                                <div className="fr-fieldset__element">
                                    <div className="fr-input-group">
                                        <label className="fr-label" htmlFor="empreinteInput">
                                            {getText('verification.empreinte.label.empreinte', textes)}
                                        </label>
                                        <input
                                            id="empreinteInput"
                                            name="empreinte"
                                            className="fr-input"
                                            type="text"
                                            value={empreinte}
                                            onChange={(e) => setEmpreinte(e.target.value)}
                                            required
                                            autoComplete="off"
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
                                                {getText('action.valider', textes) || 'Valider'}
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

export default VerifierEmpreinte;