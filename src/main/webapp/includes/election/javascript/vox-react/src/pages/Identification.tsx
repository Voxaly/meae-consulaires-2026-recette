/**
 * Copyright 2025 Voxaly Docaposte
 */

import {FormEvent, useCallback, useEffect, useRef, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import Button from "@codegouvfr/react-dsfr/Button";
import VoxMain from "../components/VoxMain";
import {useGetIdentification, usePostIdentification, usePostIdentificationFIN} from "../hooks/useIdentification";
import {getText, scrollToTop} from "../utils/utils";
import DSFRInput from "../components/DSFRInput";
import {CAPTCHA_REGEX, LOGIN_PASSWORD_REGEX} from "../utils/regex.util";
import VoxCaptcha, {CaptchaData} from "../components/VoxCaptcha";
import {VoximiusElectorModule} from "../mjs/vote_api.mjs";
import {errorHandler} from "../utils/error.util";
import {URL_CHOIX_ELECTION, URL_ERREUR} from "../config/const";
import {useGlobal} from "../hooks/useGlobal";
import {Ballot, chiffrementTemoin} from "../utils/chiffrement";
import {getOpenIdConnectLoginURL} from "../api/identification.service";
import {isNonceValide} from "../utils/identification";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {useQueryClient} from "@tanstack/react-query";

declare const JsEncryptionEngine: any;

const Identification = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const {globalData} = useGlobal();
    const {data, isLoading, isSuccess} = useGetIdentification();
    const textes = data?.textes;

    useDocumentTitle(getText('identification.titre-onglet', textes));

    const electorModule = new VoximiusElectorModule();

    // Après le chargement des données d'identification, doLogOutElecteur (côté serveur) peut avoir
    // invalidé la session (si l'électeur était connecté), ce qui change le CSRF token.
    // On force le refetch du CSRF pour que le POST utilise le token de la nouvelle session.
    useEffect(() => {
        if (isSuccess) {
            queryClient.invalidateQueries({queryKey: ['csrf']});
        }
    }, [isSuccess, queryClient]);

    // ----- FORMULAIRE ------ //

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [captcha, setCaptcha] = useState<CaptchaData>({captchaId: '', value: ''});
    const [captchaReady, setCaptchaReady] = useState<boolean>(false);
    const [captchaKey, setCaptchaKey] = useState<number>(0);

    const captchaRef = useRef<any>();

    // Réinitialisation complète de l'état au montage du composant
    useEffect(() => {
        // Réinitialiser toutes les mutations React Query pour éviter les états bloqués
        queryClient.resetQueries({queryKey: ['identification'], exact: false}).then();
        queryClient.getMutationCache().clear();

        // Réinitialiser les champs du formulaire
        setLogin('');
        setPassword('');
        setCaptcha({captchaId: '', value: ''});
        setErrors({});

        // Récupérer l'erreur depuis l'URL (après redirection OIDC/FIN ou blocage code activation)
        const urlError = searchParams.get('error');
        const urlErrorArgs = searchParams.get('errorArgs');
        if (urlError) {
            setErrors({'global': urlError, 'globalArgs': urlErrorArgs || ''});
            // Nettoyer l'URL pour ne pas réafficher l'erreur au refresh
            searchParams.delete('error');
            searchParams.delete('errorArgs');
            setSearchParams(searchParams, {replace: true});
        }

        // Récupérer l'erreur stockée dans sessionStorage (après redirection 401)
        const redirectError = sessionStorage.getItem('redirectError');
        if (redirectError) {
            try {
                const errorData = JSON.parse(redirectError);
                // Stocker le message d'erreur avec ses arguments pour affichage
                setErrors({'global': errorData.message, 'globalArgs': errorData.args?.join('|') || ''});
            } catch (e) {
                // Ignorer les erreurs de parsing
            }
            sessionStorage.removeItem('redirectError');
        }

        // Forcer le remontage complet du captcha avec une nouvelle clé
        // et retarder le montage pour éviter les race conditions
        setCaptchaReady(false);
        setCaptchaKey(prev => prev + 1);
        const timer = setTimeout(() => setCaptchaReady(true), 100);
        return () => clearTimeout(timer);

    }, [queryClient]);

    useEffect(() => {
        if (captchaReady && captchaRef.current && captcha.captchaId === '') {
            // Le captcha peut ne pas être encore initialisé (appel XHR en cours)
            // On réessaie après un court délai si getCaptchaId retourne une chaîne vide
            const captchaId = captchaRef.current.getCaptchaId();
            if (captchaId) {
                setCaptcha((prev) => ({
                    ...prev, captchaId
                }))
            } else {
                // Réessayer après 500ms si le captcha n'est pas encore prêt
                const retryTimer = setTimeout(() => {
                    if (captchaRef.current) {
                        const retryId = captchaRef.current.getCaptchaId();
                        if (retryId) {
                            setCaptcha((prev) => ({
                                ...prev, captchaId: retryId
                            }))
                        }
                    }
                }, 500);
                return () => clearTimeout(retryTimer);
            }
        }
    }, [captchaReady, captcha.captchaId])

    const {mutate: postIdentification, isPending} = usePostIdentification({
        onError: (err) => {
            errorHandler(err, setErrors, {...data?.textes, ...globalData?.common.textes});
            // Réinitialiser le captcha après une erreur
            if (captchaRef.current) {
                captchaRef.current.resetCaptcha();
                // Réinitialiser la valeur saisie
                setCaptcha(prev => ({...prev, value: ''}));
                // Attendre que le nouveau captcha soit chargé avant de récupérer son ID (1s pour être sûr)
                setTimeout(() => {
                    const newCaptchaId = captchaRef.current?.getCaptchaId();
                    if (newCaptchaId) {
                        setCaptcha(prev => ({...prev, captchaId: newCaptchaId}));
                    }
                }, 1000);
            }
        },
        onSuccess: (data) => {
            if (data.data === "generic_vote") {
                navigate(URL_CHOIX_ELECTION)
            } else {
                navigate(URL_ERREUR)
            }
        },
    });

    const isFormValid = useCallback(() => {
        if (!login || !password || !captcha.value || captcha.value.length < 4) {
            return false;
        }

        const filteredErrors = Object.fromEntries(
            Object.entries(errors).filter(([key]) => key !== 'global' && key !== 'globalArgs')
        );

        return Object.keys(filteredErrors).length <= 0;


    }, [login, password, captcha.value, errors]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // On retire l'erreur globale qui ne doit pas empêcher la soumission du formulaire
        const filteredErrors = Object.fromEntries(
            Object.entries(errors).filter(([key]) => key !== 'global' && key !== 'globalArgs')
        )

        // Si le formulaire contient des erreurs, on ne va pas plus loin
        if (Object.keys(filteredErrors).length > 0) {
            const firstErrorFieldId = Object.keys(filteredErrors)[0];
            const fieldElement = document.getElementById(firstErrorFieldId);
            fieldElement?.focus();
            return;
        }

        postIdentification({
            form: {
                autToken: electorModule.deriveIds(login, password, data?.oid),
                defi: "",
                captchaId: captchaRef.current ? captchaRef.current.getCaptchaId() : '',
                captchaDefi: captcha.value,
                calendar: "",
                temoin: temoinBallot?.ballot ? btoa(temoinBallot.ballot) : '',
                clientInfos: "",
                monologin: false,
                cookiesEnabled: true,
                javascriptEnabled: true,
            }
        })
    }

    // ----- FORMULAIRE FRANCE IDENTITÉ NUMÉRIQUE (FIN) ------ //

    const [pk, setPk] = useState<string>('');

    const {mutate: postIdentificationFIN} = usePostIdentificationFIN({
        onSuccess: (res) => {
            if (res.data.success) {
                // TODO: A améliorer avec le hook useQuery
                const urlResponse = getOpenIdConnectLoginURL();
                urlResponse
                    .then(response => {
                        const isValid = isNonceValide(response.data, pk);
                        if (isValid) window.location.href = response.data;
                        else {
                            setErrors({'global': getText('ERR-OIDC-002', textes)});
                            scrollToTop();
                        }
                    })
                    .catch(() => navigate(URL_ERREUR))
            } else {
                setErrors({'global': getText('ERR-OIDC-001', textes)})
            }
        }
    });

    const handleSubmitFIN = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const pk = electorModule.generateAndStoreSk();
        setPk(pk);

        postIdentificationFIN({
            data: {pk}
        });
    }

    // ----- MOTEUR CRYPTO POUR CHIFFREMENT DU BULLETIN TÉMOIN ------ //

    const [engine, setEngine] = useState<{ engineTemoin: any; }>({engineTemoin: null})
    const [temoinBallot, setTemoinBallot] = useState<Ballot>();

    const initEngine = useCallback((force?: boolean) => {
        if (force) {
            engine.engineTemoin = null;
        }
        if (engine.engineTemoin === null && data?.jsConfigCryptoTemoinJSON !== undefined) {
            engine.engineTemoin = new JsEncryptionEngine('TEMOIN');
            engine.engineTemoin.init(JSON.parse(atob(data.jsConfigCryptoTemoinJSON)));
        }
        setEngine(engine);

    }, [engine, data])

    useEffect(() => {
        if (isSuccess) {
            initEngine(true);
        }
    }, [initEngine, isSuccess]);

    useEffect(() => {
        if (engine.engineTemoin !== null && data !== undefined) {
            (async function () {
                const temoin = atob(data.temoin).split(',').map((val) => +val);
                const [ballot] = await Promise.all([chiffrementTemoin(engine.engineTemoin, temoin)]);
                setTemoinBallot(ballot);
            })();
        }
    }, [engine, data]);

    // ----- RENDER ------ //

    if (isLoading) return null;

    return (
        <VoxMain type={"colonne"}>
            {/* Bandeau MODE BENCHMARK */}
            {data?.modeBenchmark && (
                <div style={{backgroundColor: '#c00', color: '#fff', textAlign: 'center', padding: '0.5rem', fontWeight: 'bold', fontSize: '1rem'}}>
                    ⚠ MODE BENCHMARK ACTIF — captcha et crypto désactivés
                </div>
            )}
            {/* Erreur survenue sur le formulaire de connexion login/password */}
            {/* On n'affiche qu'une seule erreur : priorité à l'erreur locale (après soumission) sur l'erreur de session */}
            {errors && errors['global'] ? (
                <div className="fr-alert fr-alert--error fr-mb-2w" role="alert">
                    {getText(errors['global'], globalData?.common.textes, errors['globalArgs'] ? errors['globalArgs'].split('|') : [])}
                </div>
            ) : data?.error && data?.error.message ? (
                <div className="fr-alert fr-alert--error fr-mb-2w" role="alert">
                    {getText(data?.error.message, globalData?.common.textes, data?.error.args)}
                </div>
            ) : null}
            {/* Bloc Alerte "Fermeture dans..." */}
            <div className="fr-alert fr-alert--info fr-mb-3w">
                <p className="fr-text--bold"
                   dangerouslySetInnerHTML={{__html: getText('identification.dates.titre', textes) + ' ' + data!.tempsRestant}}
                />
                <ul className="vox-no-list-style">
                    <li dangerouslySetInnerHTML={{__html: getText('identification.dates.ouverture', textes, [data!.dateDebut])}}/>
                    <li dangerouslySetInnerHTML={{__html: getText('identification.dates.fermeture', textes, [data!.dateFin])}}/>
                </ul>
            </div>

            {/* Container gris */}
            <div className="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                    <div className="fr-col-12 fr-col-md-9 fr-col-lg-8">
                        <h1 className="fr-h4">
                            {getText('identification.titre', textes)}
                        </h1>

                        {/* Connexion via France Identité Numérique (FIN) */}
                        <div>
                            <h2 className="fr-h5">{getText('identification.fin.titre', textes)}</h2>
                            <p className="fr-text--sm"
                               dangerouslySetInnerHTML={{__html: getText('identification.fin.description', textes)}}
                            />
                            <form id="openid" className="vox-fin-authentication" onSubmit={(e) => handleSubmitFIN(e)}>
                                <Button type="submit" className="vox-btn-fin">
                                    <span className="fr-logo fr-logo--lg" aria-hidden
                                          dangerouslySetInnerHTML={{__html: getText('identification.fin.bouton.logo', textes)}}
                                    />
                                    <span className="vox-btn-fin-label fr-text--xs fr-mb-0">
                                        {getText('identification.fin.bouton.label', textes)}
                                    </span>
                                </Button>
                                <Link className="fr-link"
                                      to={getText('identification.fin.lien', textes)}
                                      target="_blank"
                                      title={getText('identification.fin.lien.title', textes)}
                                >
                                    {getText('identification.fin.lien.label', textes)}
                                </Link>
                            </form>
                        </div>

                        <p className="fr-hr-or fr-my-3w">
                            {getText('identification.separateur', textes)}
                        </p>

                        {/* Connexion classique (login/password) */}
                        <form id="loginForm" onSubmit={(e) => handleSubmit(e)}>
                            <fieldset className="fr-fieldset" aria-labelledby="account-form-legend">
                                <legend id="account-form-legend" className="fr-fieldset__legend">
                                    <h2 className="fr-h5">{getText('identification.compte.titre', textes)}</h2>
                                </legend>
                                <div className="fr-fieldset__element">
                                    <p className="fr-text--sm"
                                       dangerouslySetInnerHTML={{__html: getText('identification.compte.description', textes)}}
                                    />
                                </div>
                                <div className="fr-fieldset__element fr-mb-3w">
                                    <p className="fr-hint-text"
                                       dangerouslySetInnerHTML={{__html: getText('identification.champs.obligatoires', textes)}}
                                    />
                                </div>

                                {/* LOGIN */}
                                <div className="fr-fieldset__element">
                                    <DSFRInput
                                        id="loginInput"
                                        type="password"
                                        onChange={(e) => setLogin(e.target.value)}
                                        nativeInputProps={{
                                            value: login,
                                            required: true,
                                            maxLength: 15,
                                            autoComplete: "off",
                                        }}
                                        regex={LOGIN_PASSWORD_REGEX}
                                        texts={{
                                            label: getText('identification.compte.champ.identifiant.label', textes),
                                            passwordCheckBoxLabel: getText('identification.compte.champ.identifiant.afficher.label', textes),
                                            passwordCheckboxAriaLabel: getText('identification.compte.champ.identifiant.afficher.ariaLabel', textes),
                                            errorIsEmpty: getText('identification.compte.champ.identifiant.erreur.vide', textes),
                                            errorFormat: getText('identification.compte.champ.identifiant.erreur.format', textes),
                                        }}
                                        errors={errors}
                                        setErrors={setErrors}
                                    />
                                    <p className="fr-mt-1w">
                                        <Link
                                            className="fr-link"
                                            target="_blank"
                                            to={getText('identification.compte.champ.identifiant.reassort.lien', textes)}
                                            title={getText('identification.compte.champ.identifiant.reassort.title', textes)}
                                        >
                                            {getText('identification.compte.champ.identifiant.reassort.label', textes)}
                                        </Link>
                                    </p>
                                </div>

                                {/* PASSWORD */}
                                <div className="fr-fieldset__element">
                                    <DSFRInput
                                        id="passwordInput"
                                        type="password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        nativeInputProps={{
                                            value: password,
                                            required: true,
                                            maxLength: 15,
                                            autoComplete: "off",
                                        }}
                                        regex={LOGIN_PASSWORD_REGEX}
                                        texts={{
                                            label: getText('identification.compte.champ.motDePasse.label', textes),
                                            passwordCheckBoxLabel: getText('identification.compte.champ.motDePasse.afficher.label', textes),
                                            passwordCheckboxAriaLabel: getText('identification.compte.champ.motDePasse.afficher.ariaLabel', textes),
                                            errorIsEmpty: getText('identification.compte.champ.motDePasse.erreur.vide', textes),
                                            errorFormat: getText('identification.compte.champ.motDePasse.erreur.format', textes),
                                        }}
                                        errors={errors}
                                        setErrors={setErrors}
                                    />
                                    <p className="fr-mt-1w">
                                        <Link
                                            className="fr-link"
                                            target="_blank"
                                            to={getText('identification.compte.champ.motDePasse.reassort.lien', textes)}
                                            title={getText('identification.compte.champ.motDePasse.reassort.title', textes)}
                                        >
                                            {getText('identification.compte.champ.motDePasse.reassort.label', textes)}
                                        </Link>
                                    </p>
                                </div>

                                <div className="fr-fieldset__element">
                                    {captchaReady && (
                                        <VoxCaptcha
                                            key={captchaKey}
                                            instructions={getText('identification.compte.champ.captcha.description', textes)}
                                            {...captcha}
                                            ref={captchaRef}
                                            inputProps={{
                                                id: "", // ID géré par VoxCaptcha (identique au userInputID du botdetect.xml)
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

                                {/* Bouton "Submit" */}
                                <div className="fr-fieldset__element">
                                    <ul className="fr-btns-group">
                                        <li>
                                            <Button
                                                id="submitBtn"
                                                className="fr-btn fr-mt-2v"
                                                disabled={isPending || !isFormValid()}
                                            >
                                                {getText('identification.compte.bouton.connexion', textes)}
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
    )
}

export default Identification;