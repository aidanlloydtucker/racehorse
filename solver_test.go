package main

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestPlayEnd(t *testing.T) {
	// [2] adding [2|1] should be [1]

	ends := []DominoEnd{
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
	}
	move := Move{
		End: &ends[0],
		Play: &PlayedDomino{
			Orientation: OrientationDown,
			Domino: Domino{
				H: 2,
				L: 1,
			},
		},
	}
	expected := []DominoEnd{
		{
			Type:    EndTypeNormal,
			Showing: 1,
		},
	}
	newEnds := playEnds(ends, &move)
	assert.ElementsMatch(t, expected, newEnds)

	// [1,3,2,6] adding [2|1] should be [1,3,1,6]

	ends = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeNormal,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	move = Move{
		End: &ends[2],
		Play: &PlayedDomino{
			Orientation: OrientationDown,
			Domino: Domino{
				H: 2,
				L: 1,
			},
		},
	}
	expected = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeNormal,
		},
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	newEnds = playEnds(ends, &move)
	assert.ElementsMatch(t, expected, newEnds)

	// [1,3,2,6] adding [6|6] should be [1,3,2,6|6]

	ends = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeNormal,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	move = Move{
		End: &ends[3],
		Play: &PlayedDomino{
			Orientation: OrientationSide,
			Domino: Domino{
				H: 6,
				L: 6,
			},
		},
	}
	expected = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeNormal,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeDouble,
		},
	}
	newEnds = playEnds(ends, &move)
	assert.ElementsMatch(t, expected, newEnds)

	// [1,3|3,2,6] adding [3|5] should be [1,3(0),3(0),5,2,6]

	ends = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeDouble,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	move = Move{
		End: &ends[1],
		Play: &PlayedDomino{
			Orientation: OrientationUp,
			Domino: Domino{
				H: 5,
				L: 3,
			},
		},
	}
	expected = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 5,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeSide,
		},
		{
			Showing: 3,
			Type:    EndTypeSide,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	newEnds = playEnds(ends, &move)
	assert.ElementsMatch(t, expected, newEnds)

	// [1,3|3,4side4,2,6] adding [4|3] should be [1,3|3,3,4side,2,6]

	ends = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeDouble,
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
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	move = Move{
		End: &ends[2],
		Play: &PlayedDomino{
			Orientation: OrientationDown,
			Domino: Domino{
				H: 4,
				L: 3,
			},
		},
	}
	expected = []DominoEnd{
		{
			Showing: 1,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeNormal,
		},
		{
			Showing: 3,
			Type:    EndTypeDouble,
		},
		{
			Showing: 4,
			Type:    EndTypeSide,
		},
		{
			Showing: 2,
			Type:    EndTypeNormal,
		},
		{
			Showing: 6,
			Type:    EndTypeNormal,
		},
	}
	newEnds = playEnds(ends, &move)
	assert.ElementsMatch(t, expected, newEnds)

}

func TestPossibleMove(t *testing.T) {
	domino := Domino{
		H: 4,
		L: 3,
	}
	end := DominoEnd{
		Showing: 4,
		Type:    EndTypeNormal,
	}
	res := possibleMove(domino, end)
	assert.NotNil(t, res)
	assert.Equal(t, end, *res.End)
	assert.Equal(t, res.Play.Orientation, OrientationDown)
	assert.Equal(t, res.Play.Domino, domino)

	domino = Domino{
		H: 6,
		L: 3,
	}
	end = DominoEnd{
		Showing: 6,
		Type:    EndTypeNormal,
	}
	res = possibleMove(domino, end)
	assert.NotNil(t, res)
	assert.Equal(t, end, *res.End)
	assert.Equal(t, res.Play.Orientation, OrientationDown)
	assert.Equal(t, res.Play.Domino, domino)
}
