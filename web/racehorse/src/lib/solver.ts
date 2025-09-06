export class Domino {
    h: number;
    l: number;

    constructor(h: number, l: number) {
        this.h = h;
        this.l = l;
    }

    equal(other: Domino): boolean {
        return this.h === other.h && this.l === other.l;
    }

    isDouble(): boolean {
        return this.h == this.l;
    }
}

export enum Orientation {
    Up,
    Down,
    Side
}

class PlayedDomino extends Domino {
    orientation: Orientation;

    constructor(h: number, l: number, orientation: Orientation) {
        super(h, l);
        this.orientation = orientation;
    }

    equal(other: PlayedDomino): boolean {
        return super.equal(other) && this.orientation === other.orientation;
    }
}

export enum EndType {
    Normal = "NORMAL",
    Double = "DOUBLE",
    Side = "SIDE",
}

export class DominoEnd {
    showing: number;
    type: EndType;

    constructor(showing: number, type: EndType) {
        this.showing = showing;
        this.type = type;
    }

    value(): number {
        switch (this.type) {
            case EndType.Normal:
                return this.showing;
            case EndType.Double:
                return this.showing * 2;
            case EndType.Side:
                return 0;
            default:
                return this.showing;
        }
    }

    equal(other: DominoEnd): boolean {
        return this.type === other.type && this.showing === other.showing;
    }
}

export interface Move {
    toString(): string;
}

export class StartMove implements Move {
    play: PlayedDomino;

    constructor(play: PlayedDomino) {
        this.play = play;
    }

    toString(): string {
        return `Start with [${this.play.h}|${this.play.l}]`
    }

}

export class PlayMove implements Move {
    end: DominoEnd;
    play: PlayedDomino;

    constructor(end: DominoEnd, play: PlayedDomino) {
        this.end = end;
        this.play = play;
    }

    toString(): string {
        return `Play [${this.play.h}|${this.play.l}] on ${this.end.showing} (${this.end.type.toString()})`
    }

}

export class PullMove implements Move  {
    toString(): string {
        return "PULL"
    }
}


export function solve(hand: Domino[], ends: DominoEnd[]): TopScorer {
    return topScore(hand, ends)
}

export interface TopScorer {
    score: number;
    path: Move[];
}

function topScore(hand: Domino[], ends: DominoEnd[]): TopScorer {
    if ((hand.length) === 0) {
        return {
            score: 0,
            path: [new PullMove()]
        }
    }

    var bestScorer: TopScorer = {
        score: 0,
        path: [],
    };

    // if starting (eg no ends)
    if (ends.length == 0) {
        for (const dom of hand) {
            // if domino can be played first
            if (dom.isDouble() || ((dom.h + dom.l) % 5 === 0 && (dom.h + dom.l) / 5 > 0)) {
                let pDom = new PlayedDomino(dom.h, dom.l, dom.isDouble() ? Orientation.Side : Orientation.Up)
                let pMove = new StartMove(pDom)
                let newHand = subHand(hand, dom)
                let newEnds = dom.isDouble() ? [new DominoEnd(dom.h, EndType.Double)] : [new DominoEnd(dom.h, EndType.Normal), new DominoEnd(dom.l, EndType.Normal)]
                let newScore = calcScore(newEnds);

                if (canContinuePlay(newEnds, pMove)) {
                    let recScorer = topScore(newHand, newEnds);

                    if (recScorer.score + newScore > bestScorer.score) {
                        bestScorer.score = recScorer.score + newScore;
                        bestScorer.path = [pMove, ...recScorer.path]
                    } else if (recScorer.score + newScore === bestScorer.score && recScorer.path.length + 1 > bestScorer.path.length) {
                        bestScorer.score = recScorer.score + newScore;
                        bestScorer.path = [pMove, ...recScorer.path]
                    }
                } else {
                    if (newScore >= bestScorer.score) {
                        bestScorer.score = newScore;
                        bestScorer.path = [pMove]
                    }
                }
            }
        }
    } else {
        for (const e of ends) {
            for (const dom of hand) {
                let pMove = possibleMove(dom, e)
                // if we cannot make a move, continue
                if (pMove) {
                    let newHand = subHand(hand, dom)
                    let newEnds = playEnds(ends, pMove)
                    let newScore = calcScore(newEnds);

                    if (canContinuePlay(newEnds, pMove)) {
                        let recScorer = topScore(newHand, newEnds);

                        if (recScorer.score + newScore > bestScorer.score) {
                            bestScorer.score = recScorer.score + newScore;
                            bestScorer.path = [pMove, ...recScorer.path]
                        } else if (recScorer.score + newScore === bestScorer.score && recScorer.path.length + 1 > bestScorer.path.length) {
                            bestScorer.score = recScorer.score + newScore;
                            bestScorer.path = [pMove, ...recScorer.path]
                        }
                    } else {
                        if (newScore >= bestScorer.score && 1 > bestScorer.path.length) {
                            bestScorer.score = newScore;
                            bestScorer.path = [pMove]
                        }
                    }
                }
            }
        }
    }

    if (bestScorer.path.length === 0) {
        return {
            score: 0,
            path: [new PullMove()]
        }
    }

    return bestScorer
}

// playEnds plays the move on the end

function playEnds(ends: DominoEnd[], move: PlayMove): DominoEnd[] {
    let foundEnd = false;
    let newEnds: DominoEnd[] = [];
    for (const end of ends) {
        // if this is the end we used (and we only find the first), add the new end instead of the old one

        if (!foundEnd && end.showing === move.end.showing && end.type == move.end.type) {
            switch (move.play.orientation) {
                case Orientation.Side:
                    newEnds.push(new DominoEnd(move.play.h, EndType.Double));
                    break;
                case Orientation.Up:
                    newEnds.push(new DominoEnd(move.play.h, EndType.Normal));
                    break;
                case Orientation.Down:
                    newEnds.push(new DominoEnd(move.play.l, EndType.Normal));
                    break;
            }

            // if end was a double
            if (end.type == EndType.Double) {
                newEnds.push(new DominoEnd(end.showing, EndType.Side), new DominoEnd(end.showing, EndType.Side))
            }
            foundEnd = true
        } else {
            newEnds.push(end)
        }
    }

    return newEnds
}

function subHand(hand: Domino[], removedDom: Domino): Domino[] {
    return hand.filter((d) => !d.equal(removedDom))
}

function calcTotalValue(ends: DominoEnd[]): number {
    let totalValue = 0;
    for (const e of ends) {
        totalValue += e.value();
    }
    return totalValue
}

function calcScore(ends: DominoEnd[]): number {
    const tv = calcTotalValue(ends)
    if (tv%5 === 0)  {
        return tv/5
    } else {
        return 0
    }
}

function canContinuePlay(newEnds: DominoEnd[], oldMove: Move): boolean {
    return (calcScore(newEnds) > 0) || (oldMove instanceof PlayMove && oldMove.play.orientation === Orientation.Side) || (oldMove instanceof StartMove && oldMove.play.orientation === Orientation.Side);
}

function possibleMove(domino: Domino, end: DominoEnd): PlayMove | undefined {
    if (domino.isDouble()) {
        if (domino.h === end.showing) {
            return new PlayMove(end, new PlayedDomino(domino.h, domino.l, Orientation.Side))
        } else {
            return undefined;
        }
    } else if (domino.h === end.showing) {
        return new PlayMove(end, new PlayedDomino(domino.h, domino.l, Orientation.Down))
    } else if (domino.l === end.showing) {
        return new PlayMove(end, new PlayedDomino(domino.h, domino.l, Orientation.Up))
    }
    return undefined
}