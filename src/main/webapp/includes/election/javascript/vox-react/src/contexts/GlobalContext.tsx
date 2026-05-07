/**
 * Copyright 2025 Voxaly Docaposte
 */

import {createContext, ReactNode} from "react";
import {GlobalData} from "../models/global.model";

interface GlobalProps {
    global: GlobalData;
    children: ReactNode;
}

export const GlobalContext = createContext<GlobalProps['global'] | undefined>(undefined);

export const GlobalProvider = ({global, children}: GlobalProps) => (
    <GlobalContext.Provider value={global}>
        {children}
    </GlobalContext.Provider>
);
