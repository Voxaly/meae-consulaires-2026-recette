/**
 * Copyright 2025 Voxaly Docaposte
 */

import {Dispatch, SetStateAction} from "react";
import {AxiosError, AxiosResponse} from "axios";
import {Error} from "../models/error.model";
import {getText, scrollToTop} from "./utils";

/**
 * Vérifie si une réponse 200 contient des erreurs de validation.
 * Si oui, rejette la promesse pour déclencher le handler onError.
 * Cela permet d'éviter les logs d'erreur XHR dans la console navigateur
 * tout en gardant le même comportement fonctionnel.
 */
export const throwIfValidationErrors = <T>(
    response: AxiosResponse<T>
): AxiosResponse<T> => {
    const data = response.data as any;

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        throw new AxiosError(
            "Validation error",
            "VALIDATION_ERROR",
            undefined,
            undefined,
            response
        );
    }

    return response;
};

export const errorHandler = (
    error: AxiosError<{ errors: Error[] }>,
    setErrors: Dispatch<SetStateAction<Record<string, string>>>,
    textes: Record<string, string>,
) => {
    const errors = error?.response?.data?.errors || [];

    // Construire l'objet d'erreurs en une seule fois pour éviter les écrasements
    const newErrors: Record<string, string> = {};
    errors.forEach((err: Error) => {
        newErrors[err.field] = getText(err.message, textes, err.args ?? []);
        // Stocker les arguments séparément pour les erreurs globales
        if (err.field === 'global' && err.args && err.args.length > 0) {
            newErrors['globalArgs'] = err.args.join('|');
        }
    });
    setErrors(newErrors);

    if (errors.some(element => element.field === "global")) {
        // On remonte en haut de page en cas d'erreur globale
        scrollToTop();
    } else if (errors.length > 0) {
        // On focus le 1er champ en erreur (RGAA)
        const targetedFieldId = errors[0].field || '';
        document.getElementById(targetedFieldId)?.focus();
    }
};