package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Domino struct {
	H int
	L int
}

func (d Domino) Equal(c Domino) bool {
	return d.H == c.H && d.L == c.L
}

type PlayedDomino struct {
	Orientation
	Domino
}

type Orientation int

const (
	OrientationUp   Orientation = 0 // always will mean the highest number is up (not connected)
	OrientationDown Orientation = 1 // always will mean the highest number is down (not connected)
	OrientationSide Orientation = 2 // always will mean the numbers are equal so on their side
)

// Only the end is valued, rest are nil
// Possible to have 3 ends on 1 domino if it is sideways
type DominoEnd struct {
	// If end is [2,2] it will be showing 2 and value 4
	// If end is [3] it will be showing 3 and value 3
	Showing int
	Type    EndType
}

func (e DominoEnd) Value() int {
	switch e.Type {
	case EndTypeNormal:
		return e.Showing
	case EndTypeDouble:
		return e.Showing * 2
	case EndTypeSide:
		return 0
	}

	return e.Showing
}

type EndType int

const (
	EndTypeNormal EndType = 0
	EndTypeDouble EndType = 1
	EndTypeSide   EndType = 2
)

func (t EndType) String() string {
	switch t {
	case EndTypeNormal:
		return "normal"
	case EndTypeDouble:
		return "double"
	case EndTypeSide:
		return "side"
	default:
		return "unknown"
	}
}

func (e DominoEnd) Equal(a DominoEnd) bool {
	return e.Type == a.Type && e.Showing == a.Showing
}

type Move struct {
	End  *DominoEnd
	Play *PlayedDomino
	PULL bool // true if there are no more moves and you must pull. in this case End, Play = nil
}

func main() {
	var hand []Domino
	var ends []DominoEnd

	/*
				go run solver.go 62,01,40,61,24 2,44,1
				SHOULD do:
			1) Play [4|2] on 2 (normal)
			2) Play [6|1] on 1 (normal)
			3) Play [4|0] on 4 (side)
			4) Play [6|2] on 6 (normal)
		INSTEAD:
			  1) Play [4|2] on 2 (normal)
			  2) Play [6|1] on 1 (normal)
			  3) Play [6|2] on 6 (normal)
	*/

	args := os.Args[1:]
	if len(args) != 2 && len(args) != 0 {
		fmt.Println("./solver [hand] [ends]")
		fmt.Println("eg. ./solver 12,34,54 1,2,333,5-,44")
		fmt.Println("For the ends, list the number showing. If it is a double with nothing above, " +
			"list the number 3 times. If it is a double with dominoes on top and bottom, list the number 2 times. " +
			"If its a double with dominoes on top, bottom, and 1 side, you list the number first and then a dash.")
		os.Exit(1)
		return
	} else if len(args) == 2 {
		var err error
		hand, err = parseHand(args[0])
		if err != nil {
			panic(err)
		}
		ends, err = parseEnds(args[1])
		if err != nil {
			panic(err)
		}
	} else {
		//62,01,40,61,24
		hand = []Domino{
			{
				H: 6,
				L: 2,
			},
			{
				H: 4,
				L: 0,
			},
		}
		//2,44,1
		ends = []DominoEnd{
			{
				Showing: 4,
				Type:    EndTypeNormal,
			},
			{
				Showing: 4,
				Type:    EndTypeSide,
			},
			{
				Showing: 4,
				Type:    EndTypeSide,
			},
			{
				Showing: 6,
				Type:    EndTypeNormal,
			},
		}
	}

	ts, path := topScore(hand, ends)
	fmt.Printf("Top Score: %d\n", ts)
	fmt.Printf("=== PATH ===\n")
	for i, m := range path {
		if m.PULL {
			fmt.Printf("  %d) PULL\n", i+1)
		} else {
			fmt.Printf("  %d) Play [%d|%d] on %d (%s)\n", i+1, m.Play.H, m.Play.L, m.End.Showing, m.End.Type.String())
		}
	}

}

func parseHand(handStr string) ([]Domino, error) {
	var dominos []Domino
	parts := strings.Split(handStr, ",")
	for _, part := range parts {
		if len(part) != 2 {
			return nil, fmt.Errorf("domino has wrong amount of numbers: %s", part)
		}
		d1, err := strconv.Atoi(string(part[0]))
		if err != nil {
			return nil, err
		}
		d2, err := strconv.Atoi(string(part[1]))
		if err != nil {
			return nil, err
		}
		// make sure d1 is >= d2
		if d1 < d2 {
			d1, d2 = d2, d1
		}
		dominos = append(dominos, Domino{
			H: d1,
			L: d2,
		})
	}
	return dominos, nil
}

func parseEnds(endStr string) ([]DominoEnd, error) {
	var ends []DominoEnd
	parts := strings.Split(endStr, ",")
	for _, part := range parts {
		switch len(part) {
		case 1:
			d1, err := strconv.Atoi(string(part[0]))
			if err != nil {
				return nil, err
			}
			ends = append(ends, DominoEnd{
				Showing: d1,
				Type:    EndTypeNormal,
			})
		case 2:
			d1, err := strconv.Atoi(string(part[0]))
			if err != nil {
				return nil, err
			}
			if part[1] == '-' {
				ends = append(ends, DominoEnd{
					Showing: d1,
					Type:    EndTypeSide,
				})
			} else {
				d2, err := strconv.Atoi(string(part[1]))
				if err != nil {
					return nil, err
				}
				if d1 != d2 {
					return nil, fmt.Errorf("domino end numbers must be equal: %s", part)
				}
				ends = append(ends, DominoEnd{
					Showing: d1,
					Type:    EndTypeSide,
				}, DominoEnd{
					Showing: d1,
					Type:    EndTypeSide,
				})
			}

		case 3:
			d1, err := strconv.Atoi(string(part[0]))
			if err != nil {
				return nil, err
			}
			d2, err := strconv.Atoi(string(part[1]))
			if err != nil {
				return nil, err
			}
			d3, err := strconv.Atoi(string(part[2]))
			if err != nil {
				return nil, err
			}
			if d1 != d2 || d1 != d3 || d2 != d3 {
				return nil, fmt.Errorf("domino end numbers must be equal: %s", part)
			}
			ends = append(ends, DominoEnd{
				Showing: d1,
				Type:    EndTypeDouble,
			})
		default:
			return nil, fmt.Errorf("domino end has wrong amount of numbers: %s", part)
		}
	}
	return ends, nil
}

func topScore(hand []Domino, ends []DominoEnd) (int, []Move) {
	// Base Case
	if len(hand) == 0 {
		return 0, []Move{{PULL: true}}
	}
	var bestScore = 0
	var bestPath []Move

	for _, e := range ends {
		for _, dom := range hand {
			// if we cannot make a move, continue
			if pMove := possibleMove(dom, e); pMove != nil {
				newHand := subHand(hand, dom)
				newEnds := playEnds(ends, pMove)
				newScore := calcScore(newEnds)

				if canContinuePlay(newEnds, *pMove) {
					recScore, recPath := topScore(newHand, newEnds)
					if recScore+newScore > bestScore {
						bestScore = recScore + newScore
						bestPath = append([]Move{*pMove}, recPath...)
					} else if recScore+newScore == bestScore && len(recPath)+1 > len(bestPath) {
						bestScore = recScore + newScore
						bestPath = append([]Move{*pMove}, recPath...)
					}
				} else {
					if newScore >= bestScore {
						bestScore = newScore
						bestPath = []Move{*pMove}
					}
				}
			}
		}
	}

	if len(bestPath) == 0 {
		return 0, []Move{{PULL: true}}
	}
	return bestScore, bestPath
}

// playEnds plays the move on the end
func playEnds(ends []DominoEnd, move *Move) (newEnds []DominoEnd) {
	foundEnd := false
	for _, end := range ends {
		// if this is the end we used (and we only find the first), add the new end instead of the old one
		if !foundEnd && end.Showing == move.End.Showing && end.Type == move.End.Type {
			switch move.Play.Orientation {
			case OrientationSide:
				newEnds = append(newEnds, DominoEnd{
					Showing: move.Play.H,
					Type:    EndTypeDouble,
				})
			case OrientationUp:
				newEnds = append(newEnds, DominoEnd{
					Showing: move.Play.H,
					Type:    EndTypeNormal,
				})
			case OrientationDown:
				newEnds = append(newEnds, DominoEnd{
					Showing: move.Play.L,
					Type:    EndTypeNormal,
				})
			}

			// if end was a double
			if end.Type == EndTypeDouble {
				newEnds = append(newEnds, DominoEnd{
					Showing: end.Showing,
					Type:    EndTypeSide,
				}, DominoEnd{
					Showing: end.Showing,
					Type:    EndTypeSide,
				})
			}
			foundEnd = true
		} else {
			newEnds = append(newEnds, end)
		}
	}
	return
}

func subHand(hand []Domino, removedDom Domino) (newHand []Domino) {
	for _, domino := range hand {
		if !domino.Equal(removedDom) {
			newHand = append(newHand, domino)
		}
	}
	return
}

func calcTotalValue(ends []DominoEnd) (totalValue int) {
	for _, e := range ends {
		totalValue += e.Value()
	}
	return
}

func calcScore(ends []DominoEnd) (score int) {
	ts := calcTotalValue(ends)
	if ts%5 == 0 {
		return ts / 5
	} else {
		return 0
	}
}

func canContinuePlay(newEnds []DominoEnd, oldMove Move) bool {
	return calcScore(newEnds) > 0 || oldMove.Play.Orientation == OrientationSide
}

func possibleMove(domino Domino, end DominoEnd) *Move {
	if domino.H == domino.L {
		if domino.H == end.Showing {
			return &Move{
				End: &end,
				Play: &PlayedDomino{
					Orientation: OrientationSide,
					Domino:      domino,
				},
			}
		} else {
			return nil
		}
	} else if domino.H == end.Showing {
		return &Move{
			End: &end,
			Play: &PlayedDomino{
				Orientation: OrientationDown,
				Domino:      domino,
			},
		}
	} else if domino.L == end.Showing {
		return &Move{
			End: &end,
			Play: &PlayedDomino{
				Orientation: OrientationUp,
				Domino:      domino,
			},
		}
	}
	return nil
}
