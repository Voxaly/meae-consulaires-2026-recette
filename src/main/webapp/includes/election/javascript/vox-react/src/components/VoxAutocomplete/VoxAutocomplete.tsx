/**
 * Copyright 2025 Voxaly Docaposte
 */

import React, {ReactNode, useEffect, useMemo, useRef} from "react";
import './voxAutocomplete.css';
import DSFRInput, {DSFRInputProps} from "../DSFRInput";
import {createPortal} from "react-dom";

export interface VoxAutocompleteProps<T> {
    inputProps: DSFRInputProps;
    items: T[]; // Liste des items sélectionnables (1 item = 1 <li>)
    renderedItems: (item: T) => ReactNode; // Contenu des <li>
    onSelectItem: (item: T) => void; // Fonction onClick des <li>
    filterBy: (item: T) => string; // Sélection d'une propriété sur l'item pour filtrer les <li>
    isDropdownOpen: boolean;
    setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VoxAutocomplete = <T, >(props: VoxAutocompleteProps<T>) => {
    const {
        inputProps,
        items,
        renderedItems,
        onSelectItem,
        filterBy,
        isDropdownOpen,
        setIsDropdownOpen,
    } = props;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLUListElement>(null);

    const value = inputProps.nativeInputProps?.value;

    const filteredItems = useMemo(() => {
        // Pour uniformiser l'accès
        const userInput = (value as string).toLowerCase();

        // Si moins de 3 caractères, on cherche seulement ceux qui commencent par la saisie
        if ((value as string).length < 3) {
            return items.filter(item =>
                filterBy(item).toLowerCase().startsWith(userInput)
            ).sort((a, b) =>
                filterBy(a).localeCompare(filterBy(b))
            );
        }

        // Si 3 caractères ou plus, appliquer la logique complexe
        const startsWithMatches = items.filter(item =>
            filterBy(item).toLowerCase().startsWith(userInput)
        );

        const containsMatches = items.filter(item => {
            const name = filterBy(item).toLowerCase();
            return name.includes(userInput) && !name.startsWith(userInput);
        });

        // Combiner les résultats : d'abord ceux qui commencent, puis ceux qui contiennent
        // Chaque groupe est trié alphabétiquement
        const sortedStartsWith = startsWithMatches.sort((a, b) =>
            filterBy(a).localeCompare(filterBy(b))
        );

        const sortedContains = containsMatches.sort((a, b) =>
            filterBy(a).localeCompare(filterBy(b))
        );

        const matches = [...sortedStartsWith, ...sortedContains];

        return matches;

    }, [value]);

    const closeAndFocus = () => {
        setIsDropdownOpen(false);
        inputRef.current?.focus();
    }

    const handleKeyboardInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault(); // Empêche le scroll dans le dropdown
                setIsDropdownOpen(true);
                setTimeout(() => (dropdownRef.current?.firstElementChild as HTMLLIElement).focus(), 0);
                break;
            case "ArrowUp":
                e.preventDefault(); // Empêche le scroll dans le dropdown
                setIsDropdownOpen(true);
                setTimeout(() => (dropdownRef.current?.lastElementChild as HTMLLIElement).focus(), 0);
                break;
            case "Escape":
            case "Tab":
                setIsDropdownOpen(false);
                break;
        }
    }

    const handleKeyboardDropdown = (e: React.KeyboardEvent<HTMLLIElement>, item: T) => {
        const current = e.target as HTMLElement;
        const parent = current.parentElement;

        if (!parent) return;

        switch (e.key) {
            case "Enter":
                onSelectItem(item);
                closeAndFocus();
                break;
            case "Escape":
            case "Tab":
                closeAndFocus();
                break;
            case "ArrowDown":
            case "ArrowRight":
                e.preventDefault();
                const next = current.nextElementSibling as HTMLElement;
                (next ?? parent.firstElementChild)?.focus();
                break;
            case "ArrowUp":
            case "ArrowLeft":
                e.preventDefault();
                const prev = current.previousElementSibling as HTMLElement;
                (prev ?? parent.lastElementChild)?.focus();
                break;
        }
    }

    // Fermeture du dropdown si clic en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const isInsideWrapper = wrapperRef.current && wrapperRef.current.contains(target);
            const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
            if (!isInsideWrapper && !isInsideDropdown) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

    return (
        <div ref={wrapperRef} className="vox-autocomplete">
            <DSFRInput
                ref={inputRef}
                {...inputProps}
                type={"autocomplete"}
                nativeInputProps={{
                    ...inputProps.nativeInputProps,
                    onKeyDown: (e) => handleKeyboardInput(e),
                }}
            />

            {/* Dropdown Résultats */}
            {isDropdownOpen && filteredItems.length > 0 && (
                createPortal(
                    <div className="vox-autocomplete-dropdown" style={{
                        position: 'absolute',
                        top: `${inputRef.current!.getBoundingClientRect().bottom + 24 + window.scrollY}px`,
                        left: `${inputRef.current!.getBoundingClientRect().left + window.scrollX}px`,
                        width: `${inputRef.current!.getBoundingClientRect().width}px`,
                        zIndex: 9999
                    }}>
                        <ul ref={dropdownRef} role="listbox" aria-label={inputProps.texts.label} tabIndex={-1}>
                            {filteredItems.map((item, index) => (
                                <li
                                    key={`autocomplete-${inputProps.id}-${index}`}
                                    tabIndex={index === 0 ? 0 : -1}
                                    role="option"
                                    onMouseDown={(e) => {
                                        // Empêche le blur de l'input avant le click
                                        e.preventDefault();
                                    }}
                                    onClick={() => {
                                        onSelectItem(item);
                                        closeAndFocus();
                                    }}
                                    onKeyDown={(e) => handleKeyboardDropdown(e, item)}
                                >
                                    {renderedItems(item)}
                                </li>
                            ))}
                        </ul>
                    </div>,
                    document.body
                )
            )}
        </div>
    );
};

export default VoxAutocomplete;
