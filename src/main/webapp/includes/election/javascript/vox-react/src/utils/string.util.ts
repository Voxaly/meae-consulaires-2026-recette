/**
 * Copyright 2025 Voxaly Docaposte
 */

export const getDateFromTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat('fr-FR', {
        weekday: "short",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value;

    return {
        day: `${get('weekday')} ${get('day')}/${get('month')}/${get('year')}`,
        hours: `${get('hour')}:${get('minute')}`
    }
}