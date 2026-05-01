/**
 * Copyright 2025 Voxaly Docaposte
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import {Link} from 'react-router-dom';
import {startReactDsfr} from "@codegouvfr/react-dsfr/spa";
import App from './App';

startReactDsfr({defaultColorScheme: "light", Link});

declare module "@codegouvfr/react-dsfr/spa" {
    interface RegisterLink {
        Link: typeof Link;
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);