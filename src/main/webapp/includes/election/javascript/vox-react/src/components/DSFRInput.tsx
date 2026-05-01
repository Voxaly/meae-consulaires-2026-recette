/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {
    ChangeEvent,
    DetailedHTMLProps,
    Dispatch,
    FocusEvent,
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    SetStateAction,
    useState
} from "react";
import {fr} from "@codegouvfr/react-dsfr";
import {useGlobal} from "../hooks/useGlobal";

interface InputTextsProps {
    label: string;
    description?: string;
    passwordCheckBoxLabel?: string;
    passwordCheckboxAriaLabel?: string;
    errorIsEmpty?: string;
    errorFormat?: string;
}

export interface DSFRInputProps {
    id: string;
    type?: "password" | "autocomplete";
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    nativeInputProps?: Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'>;
    regex?: RegExp;
    texts: InputTextsProps;
    errors: any;
    setErrors: Dispatch<SetStateAction<any>>;
}

const DSFRInput = forwardRef((props: DSFRInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
        id,
        type,
        onChange,
        nativeInputProps,
        regex,
        texts,
        errors,
        setErrors,
    } = props;

    const {globalData} = useGlobal();

    const [showInputValue, setShowInputValue] = useState<boolean>(type !== "password");

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        deleteError();
        if (onChange) onChange(e);
    }

    const onInputBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
        if (type !== "autocomplete") {
            // Erreur si le format n'est pas respecté (maxLength ou Regex)
            const maxLength = nativeInputProps?.maxLength;
            // Erreur si le champ est vide
            if (nativeInputProps?.required && e.target.value.length === 0) {
                setErrors((prev: any) => ({...prev, [id]: texts.errorIsEmpty ?? "Ce champ est obligatoire."}))
            } else if ((maxLength && e.target.value.length > maxLength) || (regex && !regex.test(e.target.value))) {
                setErrors((prev: any) => ({...prev, [id]: texts.errorFormat ?? "Le format n'est pas respecté."}))
            }
        }
    }

    const onRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setShowInputValue(true);
        else setShowInputValue(false);
    }

    const deleteError = () => {
        if (errors?.[id] && !errors[id].field?.startsWith('ERR-')) {
            setErrors((prev: any) => {
                const {[id]: _, ...rest} = prev;
                return rest;
            })
        }
    };

    return (
        <div
            className={fr.cx('fr-input-group', type === "password" && 'fr-password', !!errors?.[id] && 'fr-input-group--error')}>
            <label className="fr-label" htmlFor={id}>
                {texts.label}
                {texts.description && (
                    <span className="fr-hint-text" dangerouslySetInnerHTML={{__html: texts.description}}/>
                )}
            </label>
            <input
                ref={ref}
                id={id}
                name={id}
                className={fr.cx('fr-input', !!errors?.[id] && 'fr-input--error')}
                type={showInputValue ? 'text' : 'password'}
                aria-describedby={`${id}-messages`}
                onBlur={(e) => onInputBlur(e)}
                {...nativeInputProps}
                onChange={(e) => onInputChange(e)}
            />
            {/* Checkbox Afficher/Masquer si type "password" */}
            {type === "password" && (
                <div className="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm">
                    <input
                        id={`${id}-show`}
                        type="checkbox"
                        onChange={(e) => onRadioChange(e)}
                        aria-label={texts.passwordCheckboxAriaLabel ?? "Afficher"}
                        aria-describedby={`${id}-show-messages`}
                    />
                    <label className="fr-password__checkbox fr-label" htmlFor={`${id}-show`}>
                        {texts.passwordCheckBoxLabel ?? "Afficher"}
                    </label>
                </div>
            )}
            {/* Message d'erreur */}
            {!!errors?.[id] && (
                <div id={`${id}-messages`} className="fr-messages-group" aria-live="assertive">
                    <p id={`${id}-errors`} className={"fr-message fr-message--error"} aria-live="polite">
                        {errors[id]}
                    </p>
                </div>
            )}
        </div>
    );
});

export default DSFRInput;