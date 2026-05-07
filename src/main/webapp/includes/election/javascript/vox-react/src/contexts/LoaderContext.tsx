/**
 * Copyright 2025 Voxaly Docaposte
 */

import {createContext, ReactNode, useState} from "react";

interface LoaderProps {
    setLoading: (loading: boolean) => void
}

export const LoaderContext = createContext<LoaderProps>({
    setLoading: () => {
    }
})

export const LoaderProvider = ({children}: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const value = {setLoading};

    return (
        <LoaderContext.Provider value={value}>
            {loading && (
                <div>Chargement...</div>
            )}
            {children}
        </LoaderContext.Provider>
    )
}