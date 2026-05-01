/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useLocation} from "react-router-dom";
import {useEffect} from "react";

const AutoScrollToTop = () => {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default AutoScrollToTop;