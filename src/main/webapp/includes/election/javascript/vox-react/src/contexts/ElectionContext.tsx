/**
 * Copyright 2025 Voxaly Docaposte
 */

import {createContext, ReactNode, useState} from "react";

interface Election {
    id: number;
    name: string;
}

interface ElectionContextProps {
    election: Election | null;
    setElection: (election: Election | null) => void;
}

export const ElectionContext = createContext<ElectionContextProps>({
    election: null,
    setElection: () => {
    },
});

export const ElectionProvider = ({children}: { children: ReactNode }) => {
    const [election, setElection] = useState<Election | null>(null);

    return (
        <ElectionContext.Provider value={{election, setElection}}>
            {children}
        </ElectionContext.Provider>
    )
}