import React, {use, useState} from 'react';
import './App.css';
import {DominoHalfIcon, DominoIcon, DominoOrientation} from "./lib/icons";
import {Button, ButtonGroup, Card, Col, Container, Modal, Row, Stack} from "react-bootstrap";
import {Domino, DominoEnd, EndType, PlayMove, PullMove, solve, StartMove, TopScorer} from "./lib/solver";
import {DashLg, PlusLg} from "react-bootstrap-icons";

function App() {

    let [hand,setHand] = useState<Domino[]>([])
    let [showAddHandModal, setShowAddHandModal] = useState<boolean>(false)
    let [ends, setEnds] = useState<DominoEnd[]>([])
    let [topScorer, setTopScorer] = useState<TopScorer | null>(null)

    const displayEnds = () => {

        const displayEnd = (end: DominoEnd) => {

            const renderIcon = () => {
                switch (end.type) {
                    case EndType.Normal:
                        return <DominoHalfIcon num={end.showing}/>;
                    case EndType.Double:
                        return <DominoIcon high={end.showing} low={end.showing} />;
                    case EndType.Side:
                        return <DominoHalfIcon num={end.showing} orientation={DominoOrientation.Side} />;
                }
            }

            let count = ends.filter(x => x.equal(end)).length

            const canAdd = () => {
                switch (end.type) {
                    case EndType.Normal:
                        return count < 5
                    case EndType.Double:
                        return count < 1
                    case EndType.Side:
                        return count < 2
                }
            }

            const addOnClick = () => {
                if (canAdd()) setEnds([...ends, new DominoEnd(end.showing, end.type)])
            }

            return (
                <Col>
                    {renderIcon()}
                    <ButtonGroup size="sm" >
                        <Button variant="outline-secondary" disabled={!canAdd()} onClick={addOnClick}><PlusLg /></Button>
                        <Button disabled variant="outline-dark" className="opacity-100 z-3">{count}</Button>
                        <Button variant="outline-secondary" disabled={count <= 0} onClick={() => setEnds(removeOneFromEnds(ends, end))}><DashLg /></Button>
                    </ButtonGroup>
                </Col>
            )
        }

        return (<Container className="d-grid row-gap-5 mt-3">
            <Row>
                {AllEnds.filter((x) => x.type === EndType.Normal).map((e) => (
                    displayEnd(e)
                )) }
            </Row>


            <Row>
                {AllEnds.filter((x) => x.type === EndType.Double).map((e) => (
                    displayEnd(e)
                )) }
            </Row>


            <Row>
                {AllEnds.filter((x) => x.type === EndType.Side).map((e) => (
                    displayEnd(e)
                )) }
            </Row>

        </Container>)
    }

    const displayMoves = () => {
        const renderIcon = (end: DominoEnd) => {
            switch (end.type) {
                case EndType.Normal:
                    return <DominoHalfIcon num={end.showing} />;
                case EndType.Double:
                    return <DominoIcon high={end.showing} low={end.showing} />;
                case EndType.Side:
                    return <DominoHalfIcon num={end.showing} orientation={DominoOrientation.Side} />;
            }
        }

        return topScorer?.path.map((move) => {
            console.log(move.toString())
            if (move instanceof PlayMove) {


                return (<li style={{listStylePosition: "inside", marginBottom: "50px"}}>
                    Play&nbsp;<div className="domino-inline"><DominoIcon high={move.play.h} low={move.play.l} /></div>
                    &nbsp;on&nbsp;
                    <div className="domino-inline">
                        {renderIcon(move.end)}
                    </div>
                </li>)
            } else if (move instanceof PullMove) {
                return <li style={{listStylePosition: "inside"}}>PULL!</li>;
            } else if (move instanceof StartMove) {
                return (<li style={{listStylePosition: "inside", marginBottom: "50px"}}>
                    Start with&nbsp;<div className="domino-inline"><DominoIcon high={move.play.h} low={move.play.l} /></div>
                </li>)
            }
        })
    }

    return (
    <div>
        <Container>
            {/*<Button variant="primary">Run</Button>*/}
            {/*<br />*/}
            <Stack gap={3}>
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>Your Hand</Card.Title>
                        <Container>
                            <Row className="justify-content-center">
                                <Col xxl={4}>
                                    <Row xxl={4} className="justify-content-center">
                                        {hand.map((d) => (
                                            <Col key={`hand.d.${d.h}.${d.l}`}>
                                                <DominoIcon
                                                    high={d.h} low={d.l}
                                                    onClick={() => {
                                                        setHand(hand.filter((x) => !x.equal(d)))
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Col>
                            </Row>
                        </Container>
                        <Button variant="success" onClick={() => setShowAddHandModal(true)}>Add</Button>
                    </Card.Body>
                </Card>


                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>Ends</Card.Title>
                        {displayEnds()}
                        <br />
                        <Button variant="danger" onClick={() => {
                            setEnds([]);
                            setTopScorer(null);
                        }}>Clear</Button>
                    </Card.Body>
                </Card>

                <Button variant="primary" size="lg" onClick={() => setTopScorer(solve(hand, ends))}>Calculate</Button>



                {topScorer &&
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Play</Card.Title>
                            <Card.Subtitle>Score: {topScorer?.score}</Card.Subtitle>
                            <ol>
                                {displayMoves()}
                            </ol>
                        </Card.Body>
                    </Card>
                }

            </Stack>
        </Container>


        <Modal show={showAddHandModal} onHide={() => setShowAddHandModal(false)} className="modal-lg">
            <Modal.Header closeButton>
                <Modal.Title>Add to Hand</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row xl={4}  className="justify-content-center">
                    {AllDominoes.filter((x) => !hand.find((y) => y.equal(x))).map((dom, idx) => (
                        <Col key={idx}>
                            <DominoIcon high={dom.h} low={dom.l} onClick={() => setHand([...hand, dom])} />
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAddHandModal(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
  );
}

const AllDominoes: Domino[] = [
    new Domino(0, 0),

    new Domino(1, 0),
    new Domino(1, 1),

    new Domino(2, 0),
    new Domino(2, 1),
    new Domino(2, 2),

    new Domino(3, 0),
    new Domino(3, 1),
    new Domino(3, 2),
    new Domino(3, 3),

    new Domino(4, 0),
    new Domino(4, 1),
    new Domino(4, 2),
    new Domino(4, 3),
    new Domino(4, 4),

    new Domino(5, 0),
    new Domino(5, 1),
    new Domino(5, 2),
    new Domino(5, 3),
    new Domino(5, 4),
    new Domino(5, 5),

    new Domino(6, 0),
    new Domino(6, 1),
    new Domino(6, 2),
    new Domino(6, 3),
    new Domino(6, 4),
    new Domino(6, 5),
    new Domino(6, 6),
]

// Ordered
const AllEnds: DominoEnd[] = [
    new DominoEnd(0, EndType.Normal),
    new DominoEnd(1, EndType.Normal),
    new DominoEnd(2, EndType.Normal),
    new DominoEnd(3, EndType.Normal),
    new DominoEnd(4, EndType.Normal),
    new DominoEnd(5, EndType.Normal),
    new DominoEnd(6, EndType.Normal),

    new DominoEnd(0, EndType.Double),
    new DominoEnd(1, EndType.Double),
    new DominoEnd(2, EndType.Double),
    new DominoEnd(3, EndType.Double),
    new DominoEnd(4, EndType.Double),
    new DominoEnd(5, EndType.Double),
    new DominoEnd(6, EndType.Double),

    new DominoEnd(0, EndType.Side),
    new DominoEnd(1, EndType.Side),
    new DominoEnd(2, EndType.Side),
    new DominoEnd(3, EndType.Side),
    new DominoEnd(4, EndType.Side),
    new DominoEnd(5, EndType.Side),
    new DominoEnd(6, EndType.Side),
]

function removeOneFromEnds(ends: DominoEnd[], endToRemove: DominoEnd): DominoEnd[] {
    const firstIndex = ends.findIndex(x => x.equal(endToRemove)); // Find the first occurrence

    if (firstIndex !== -1) {
        return [...ends.slice(0, firstIndex), ...ends.slice(firstIndex+1)];
    }
    return ends;
}

export default App;
