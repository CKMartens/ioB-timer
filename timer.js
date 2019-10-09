/**
  ##########         TIMER          ##########
Schaltaktoren zeitgesteuert schalten

  23.09.2019:   V0.0.1  Initialrelease (quick&Durty)
  27.09.2019:   V0.0.2  Code funktional überarbeitet
  02.10.2019:   V0.1.0  Funktionale Testversion
  04.10.2019:   V0.1.5  Bugfixes Countdown, Bugfix Aktorhandling, Restlaufzeit erhält führende '0'
  05.10.2019:   V0.2.0  Für VIS Timer in Datenpunkte für Std, Min, Sek aufgeteilt

  to do:


  Author: CKMartens (carsten.martens@outlook.de)
  License: GNU General Public License V3, 29. Juni 2007
**/

/**
  ##########         Variablen          ##########
**/
var i_Std, i_Min, i_Sek, i_MSek;
var i_downStd, i_downMin, i_downSek, i_downMSek;
var s_RStd, s_RMin, s_RSek;
var timer, countdown;

// Informationen mitloggen?
var DEBUG = true;

/**
  ##########         Pfade          ##########
**/
var JSPath                  = 'javascript.0.';                                  // Pfad zu den Javascript-Datenpunkte
var Path                    = JSPath + 'Timer.';                                // Pfad zu den Datenpunkten des Scripts

/**
  ##########         Datenpunkte          ##########
**/
createState(Path + 'TimerStd', '12', {
  name: 'länge des Timer',
	type: 'string',
  role: 'value',
	desc: 'Wie lange soll der Timer laufen? (Stunden)'
});

createState(Path + 'TimerMin', '0', {
  name: 'länge des Timer',
	type: 'string',
  role: 'value',
	desc: 'Wie lange soll der Timer laufen? (Minuten)'
});

createState(Path + 'TimerSek', '0', {
  name: 'länge des Timer',
	type: 'string',
  role: 'value',
	desc: 'Wie lange soll der Timer laufen? (Sekunden)'
});

createState(Path + 'Aktor', 'deconz.0.Lights.4.on',{
  name: 'Aktor',
	type: 'string',
   role: 'value',
	desc: 'Welcher Aktor saoll geschaltet werden. Vollen Datenpunkt angeben'
});

createState(Path + 'Start', false, {
  name: 'Start/Stop des Timer',
  type: 'boolean',
  role: 'state',
  desc: 'Den Timer starten oder stopen'
});

createState(Path + 'Abgelaufen', false, {
  name: 'Timer Abgelaufen',
  type: 'boolean',
  role: 'state',
  desc: 'Wird wahr wenn der Timer abgelaufen ist'
});

createState(Path + 'Countdown', '12:00:00', {
  name: 'Countdown',
	type: 'string',
  role: 'state',
	desc: 'Restlaufzeit des Timers. Ab Restlaufzeit von einer Minute Sekündliche Anzeige'
});

/**
  ##########         Pfade          ##########
**/
const TIMER_START = Path + 'Start';
const TIMER_ABGELAUFEN = Path + 'Abgelaufen';
const TIMER_AKTOR = Path + 'Aktor';
const TIMER_TIMERSTD = Path + 'TimerStd';
const TIMER_TIMERMIN = Path + 'TimerMin';
const TIMER_TIMERSEK = Path + 'TimerSek';
const TIMER_COUNTDOWN = Path + 'Countdown';

/**
  ##########         Funktionen          ##########
**/
function timer2msek() {

  i_Std = getState(TIMER_TIMERSTD).val;
  i_Min = getState(TIMER_TIMERMIN).val;
  i_Sek = getState(TIMER_TIMERSEK).val;

  i_MSek = i_Std * 3600000 + i_Min * 60000 + i_Sek * 1000;

  return i_MSek;
}

/**
  ##########         Timer          ##########
**/
on({id: TIMER_START, change: "ne"}, function (obj) {
  if (getState(TIMER_START).val == true) {
    setState(TIMER_ABGELAUFEN, false);

    var s_Aktor = getState(TIMER_AKTOR).val;

    i_MSek = timer2msek();

    let i_hilfCount = 0;
    i_downStd = 0;
    i_downMin = 0;
    i_downSek = 0;
    i_downMSek = i_MSek;

    // Countdown für Restlaufzeit
	countdown = setInterval(function () {
      i_downMSek = i_downMSek - 1000;

      i_downStd = Math.floor(i_downMSek / 3600000);
      s_RStd = String(i_downStd);
      if (i_downStd <= 9) s_RStd = String(('0' + i_downStd));

      i_downMin = Math.floor(i_downMSek / 60000) - (i_downStd * 60);
      s_RMin = String(i_downMin);
      if (i_downMin <= 9) s_RMin = String(('0' + i_downMin));

      i_downSek = (i_downMSek / 1000) - (i_downMin * 60) - (i_downStd * 3600);
      s_RSek = String(i_downSek);
      if (i_downSek <= 9) s_RSek = String(('0' + i_downSek));

	  setState(TIMER_COUNTDOWN, s_RStd+':'+s_RMin+':'+s_RSek);
    }, 1000);

    setState(s_Aktor, true);
    if (DEBUG) log('Timer für '+i_Min+' Minuten gestartet, Aktor '+s_Aktor+' eingeschaltet');

    // Timer starten
    timer = setTimeout(function() {
        setState(TIMER_ABGELAUFEN, true);
        setState(TIMER_START, false);
        timer = null;
        clearTimeout(timer);
        countdown = null;
        clearInterval(countdown);
        setState(TIMER_COUNTDOWN, '00:00:00');
    }, i_MSek);
  } else {
      if (getState(TIMER_ABGELAUFEN).val == false) {
        var s_Aktor = getState(TIMER_AKTOR).val;
        setState(s_Aktor, false);
        setState(TIMER_ABGELAUFEN, true);
        setState(TIMER_START, false);
        clearTimeout(timer);
        timer = null;
        clearInterval(countdown);
        countdown = null;
        setState(TIMER_COUNTDOWN, '00:00:00');
    }
  }
});
