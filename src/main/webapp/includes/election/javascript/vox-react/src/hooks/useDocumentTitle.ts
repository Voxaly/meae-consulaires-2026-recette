/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useEffect} from "react";
import {useGlobal} from "./useGlobal";

const useDocumentTitle = (title: string) => {
    const {globalData} = useGlobal();

    useEffect(() => {
        document.title = `${title} - ${globalData?.common.nomOperation}`;
    }, [title]);
}

export default useDocumentTitle;