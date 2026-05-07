/**
 * Copyright 2025 Voxaly Docaposte
 */

import {useEffect, useState} from "react";

interface CountdownProps {
    maxTime: number;
    onCountdownEnd: () => void;
}

export const Countdown = (props: CountdownProps) => {
    const {maxTime, onCountdownEnd} = props;

    const [countdown, setCountdown] = useState<number>(maxTime || 0);

    useEffect(() => {
        let timer: number;

        if (maxTime) {
            timer = window.setInterval(() => {
                setCountdown(countdown => {
                    if (countdown <= 1) {
                        clearInterval(timer);
                        onCountdownEnd();
                    }
                    return countdown - 1;
                });
            }, 1000);
            setCountdown(maxTime);
        }

        // Clean-up function
        return () => {
            !isNaN(timer) && clearInterval(timer)
        }
    }, [maxTime, onCountdownEnd]);

    return (
        <>{countdown}</>
    );
};

export default Countdown;