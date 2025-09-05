import React from "react";


import D00 from './svgr_icons/00.js';
import D10 from './svgr_icons/10.js';
import D11 from './svgr_icons/11.js';
import D20 from './svgr_icons/20.js';
import D21 from './svgr_icons/21.js';
import D22 from './svgr_icons/22.js';
import D30 from './svgr_icons/30.js';
import D31 from './svgr_icons/31.js';
import D32 from './svgr_icons/32.js';
import D33 from './svgr_icons/33.js';
import D40 from './svgr_icons/40.js';
import D41 from './svgr_icons/41.js';
import D42 from './svgr_icons/42.js';
import D43 from './svgr_icons/43.js';
import D44 from './svgr_icons/44.js';
import D50 from './svgr_icons/50.js';
import D51 from './svgr_icons/51.js';
import D52 from './svgr_icons/52.js';
import D53 from './svgr_icons/53.js';
import D54 from './svgr_icons/54.js';
import D55 from './svgr_icons/55.js';
import D60 from './svgr_icons/60.js';
import D61 from './svgr_icons/61.js';
import D62 from './svgr_icons/62.js';
import D63 from './svgr_icons/63.js';
import D64 from './svgr_icons/64.js';
import D65 from './svgr_icons/65.js';
import D66 from './svgr_icons/66.js';

function dominoToIcon(high: number, low: number): React.FC<React.SVGAttributes<SVGElement>> {
    switch (high) {
        case 0:
            switch (low) {
                case 0:
                    return D00
                default:
                    throw "unknown domino";
            }
        case 1:
            switch (low) {
                case 0:
                    return D10
                case 1:
                    return D11
                default:
                    throw "unknown domino";
            }
        case 2:
            switch (low) {
                case 0:
                    return D20
                case 1:
                    return D21
                case 2:
                    return D22
                default:
                    throw "unknown domino";
            }
        case 3:
            switch (low) {
                case 0:
                    return D30
                case 1:
                    return D31
                case 2:
                    return D32
                case 3:
                    return D33
                default:
                    throw "unknown domino";
            }
        case 4:
            switch (low) {
                case 0:
                    return D40
                case 1:
                    return D41
                case 2:
                    return D42
                case 3:
                    return D43
                case 4:
                    return D44
                default:
                    throw "unknown domino";
            }
        case 5:
            switch (low) {
                case 0:
                    return D50
                case 1:
                    return D51
                case 2:
                    return D52
                case 3:
                    return D53
                case 4:
                    return D54
                case 5:
                    return D55
                default:
                    throw "unknown domino";
            }
        case 6:
            switch (low) {
                case 0:
                    return D60
                case 1:
                    return D61
                case 2:
                    return D62
                case 3:
                    return D63
                case 4:
                    return D64
                case 5:
                    return D65
                case 6:
                    return D66
                default:
                    throw "unknown domino";
            }
        default:
            throw "unknown domino";
    }
}

export const DominoIcon: React.FC<{
    high: number;
    low: number;
    onClick?: () => void;
}> = ({high, low, onClick})=>{
    const Icon = dominoToIcon(high, low);
    return (
        <div className={`domino domino-side domino-sm ${onClick && "domino-clickable"}`} onClick={onClick} >
            <Icon viewBox="25 0 78 128"/>
        </div>
    )
}

export enum DominoOrientation {
    Up = "up",
    Side = "side"
}

export const DominoHalfIcon: React.FC<{
    num: number;
    orientation?: DominoOrientation;
    onClick?: () => void;
}> = ({num, orientation=DominoOrientation.Up, onClick})=>{
    const Icon = dominoToIcon(num, 0);
    return (
        <div className={`domino domino-half-sm domino-half-${orientation} ${onClick && "domino-clickable"}`}  onClick={onClick} >
            <Icon viewBox="25 64 78 64"/>
            {/*<Badge className="rounded-pill position-absolute top-0">9</Badge>*/}
        </div>
    )
}