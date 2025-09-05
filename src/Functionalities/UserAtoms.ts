import { Move } from 'chess.js';
import { atom } from "recoil";

export const movesAtom = atom<Move[]>({
    key: "movesAtom",
    default: []
})
    