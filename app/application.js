import Cycle from '@cycle/core';
import {makeDOMDriver, button} from '@cycle/dom';
import moment from 'moment';
import Rx from 'rx';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import {parseActions} from './models/trello';
import {parseTrelloData} from './models/graph';

function buttonView ( state$ ) {
  return state$.map( () => button( 'Get actions' ) )
}

function main ( { DOM, Trello } ) {
  const buttonClicks$ = DOM.select( 'button' ).events( 'click' ).startWith( false );

  const displayedLists = [ "Backlog", "Card Preparation", "Production", "Tests QA", "Mise en live", "In Production", "Live (March 2016)" ];
  const trelloActions$ = Rx.Observable.combineLatest(
    Trello.lists$.startWith( [] ),
    Trello.actions$.startWith( [] ),
    parseActions( moment().format( 'YYYY-MM-DD' ) )
  );

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    graph: trelloActions$.map( parseTrelloData( displayedLists ) ),
    log: trelloActions$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  graph: makeGraphDriver( '#chart svg' ),
  log: logDriver
};

Cycle.run( main, drivers );
