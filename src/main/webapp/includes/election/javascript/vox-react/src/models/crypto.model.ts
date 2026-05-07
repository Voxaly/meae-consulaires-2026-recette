/**
 * Copyright 2025 Voxaly Docaposte
 */

export interface Point {
    x: string;
    y: string;
}

export interface VoteCrypto {
    voteType: string;
    groupParameters: {
        p: string;
        d: string;
        q: string;
        g: Point;
        one: Point;
    };
    electionPublicKey: Point;
    uuidString: string;
    tokenId: string;
    questions: {
        minSelection: number;
        maxSelection: number;
        nbElements: number;
        isBlankAllowed: boolean;
        isInvalidAllowed: boolean;
    }[];
    delimiteurVoteNH: number;
    nbBoucle: number;
    nbBoucleFixed: boolean;
    pSize: number;
    qSize: number;
    proofNeeded: boolean;
    timeMaxNbBoucle: number;
    timeMaxWait: number;
    votesSize: number;
    statsLevel: number;
    bigIntegerRndPool: string[];
}

export interface Engine {
    ballot: Ballot;
    init: (parameters: any) => void;
    setVote: (voteList: any) => void;
    startUserProgressBar: any;
    getUserProgression: () => number | any;
    isFinished: () => boolean;
    getRemainingTime: () => number;
    getBallot: (userSecretCode: any) => any;
    ballotTypeSwitch: any;
    getStatistics: () => {};
}

export interface Ballot {
    election: any;
    finished: boolean;
    stats: {
        tasksTotal: number;
        taskSkipped: number;
        resolve: number;
        toJson: () => {};
    }
    listTasks: () => any[]
    processTask: () => void;
    computeBit: (question: any, value: number, num: number) => void;
    fillAnswers: (question: any) => void
    generateOtherProof: (question: any) => void;
    finish: () => void;
    resolveOperand: (operand: any) => void;
    individualProofGenerator: any;
    getProgress: () => number;
    fill: (votes: any) => void;
    get: () => {};
}